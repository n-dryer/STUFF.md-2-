
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const APP_FOLDER_NAME = 'STUFF.md_DATA';

const getHeaders = (accessToken: string) => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
});

async function findOrCreateAppFolder(accessToken: string): Promise<string> {
    const headers = getHeaders(accessToken);
    const query = `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`;
    const response = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, { headers });

    if (!response.ok) throw new Error('Failed to search for app folder.');

    const data = await response.json();
    if (data.files && data.files.length > 0) {
        return data.files[0].id;
    }

    const folderMetadata = {
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
    };
    const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
        method: 'POST',
        headers,
        body: JSON.stringify(folderMetadata)
    });
    if (!createResponse.ok) throw new Error('Failed to create app folder.');
    const createdFolder = await createResponse.json();
    return createdFolder.id;
}


async function findOrCreateFolderHierarchy(accessToken: string, path: string[], parentFolderId: string): Promise<string> {
    let currentParentId = parentFolderId;
    const headers = getHeaders(accessToken);

    for (const folderName of path) {
        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${currentParentId}' in parents and trashed=false`;
        const response = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, { headers });
        if (!response.ok) throw new Error(`Failed to search for folder: ${folderName}`);
        
        const data = await response.json();
        if (data.files && data.files.length > 0) {
            currentParentId = data.files[0].id;
        } else {
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [currentParentId]
            };
            const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
                method: 'POST',
                headers,
                body: JSON.stringify(folderMetadata)
            });
            if (!createResponse.ok) throw new Error(`Failed to create folder: ${folderName}`);
            const createdFolder = await createResponse.json();
            currentParentId = createdFolder.id;
        }
    }
    return currentParentId;
}


export async function saveFile(accessToken: string, path: string[], filename: string, content: string): Promise<any> {
    const appFolderId = await findOrCreateAppFolder(accessToken);
    const targetFolderId = await findOrCreateFolderHierarchy(accessToken, path, appFolderId);

    const metadata = {
        name: filename,
        parents: [targetFolderId],
        mimeType: 'text/plain'
    };

    const multipartRequestBody =
        `--boundary_string\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--boundary_string\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        `${content}\r\n` +
        `--boundary_string--`;

    const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related; boundary=boundary_string'
        },
        body: multipartRequestBody
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.error("File save error:", error);
        throw new Error('Failed to save file to Google Drive.');
    }

    return response.json();
}

export async function listFiles(accessToken: string): Promise<any[]> {
    const appFolderId = await findOrCreateAppFolder(accessToken);
    const headers = getHeaders(accessToken);
    const query = `'${appFolderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed=false`;

    let allFiles: any[] = [];
    let pageToken: string | undefined = undefined;

    async function fetchPage() {
        const url = new URL(`${DRIVE_API_URL}/files`);
        url.searchParams.append('q', `trashed=false and mimeType='text/plain'`);
        url.searchParams.append('fields', 'nextPageToken, files(id, name, parents, webViewLink, createdTime)');
        url.searchParams.append('spaces', 'drive');
        if (pageToken) {
            url.searchParams.append('pageToken', pageToken);
        }

        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error('Failed to list files.');

        const data = await response.json();
        allFiles = allFiles.concat(data.files);
        pageToken = data.nextPageToken;

        if(pageToken) {
            await fetchPage();
        }
    }

    await fetchPage();
    return allFiles;
}

export async function getFileContent(accessToken: string, fileId: string): Promise<string> {
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, { headers });
    if (!response.ok) throw new Error('Failed to get file content.');
    return response.text();
}
