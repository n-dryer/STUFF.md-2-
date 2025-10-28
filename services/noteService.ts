

import { AIResponse, Note } from '../types';
import { getCategorization } from './aiService';
import * as drive from './googleDriveService';
import { parse, stringify } from 'yaml';


function generateFilename(content: string): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const title = content.split(/\s+/).slice(0, 5).join('_').replace(/[^\w]/g, '') || 'note';
    return `${title}_${timestamp}.txt`;
}

export async function createNote(
    accessToken: string,
    content: string,
    userPrompt: string
): Promise<{ note: Note, feedback: string }> {
    const aiResult = await getCategorization(content, userPrompt);
    
    const categoryPath = aiResult?.categories && aiResult.categories.length > 0 ? aiResult.categories : ['Uncategorized'];
    const tags = aiResult?.tags || [];
    const date = new Date().toISOString();
    
    const frontMatter = {
        tags: tags,
        date: date,
        summary: aiResult?.summary || 'N/A',
        title: aiResult?.title || 'Untitled Note'
    };
    
    const fileContent = `---\n${stringify(frontMatter)}---\n${content}`;
    const filename = generateFilename(content);
    
    const savedFile = await drive.saveFile(accessToken, categoryPath, filename, fileContent);

    // FIX: Property 'title' is missing in type '{ id: any; name: string; path: string[]; content: string; tags: string[]; date: string; summary: string; }' but required in type 'Note'.
    const newNote: Note = {
        id: savedFile.id,
        name: filename,
        path: categoryPath,
        content: content,
        tags: tags,
        date: date,
        title: aiResult?.title || 'Untitled Note',
        summary: aiResult?.summary,
    };
    
    const feedback = aiResult 
        ? `Saved to ${categoryPath.join('/')}`
        : `AI categorization failed. Saved to Uncategorized.`;
    
    return { note: newNote, feedback };
}

async function getFolderPathForFile(accessToken: string, file: any, allFolders: Map<string, {name: string, parent: string | undefined}>): Promise<string[]> {
    let path: string[] = [];
    let currentParentId = file.parents?.[0];

    while(currentParentId) {
        const parentFolder = allFolders.get(currentParentId);
        if(parentFolder){
            path.unshift(parentFolder.name);
            currentParentId = parentFolder.parent;
        } else {
           break;
        }
    }
    // Remove app folder name from path
    if (path.length > 0 && path[0].includes('STUFF.md_DATA')) {
        path.shift();
    }
    return path.length > 0 ? path : ['Uncategorized'];
}

export async function getNotes(accessToken: string): Promise<Note[]> {
    const files = await drive.listFiles(accessToken);

    const folderQuery = `trashed=false and mimeType='application/vnd.google-apps.folder'`;
    const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name,parents)`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const folderData = await folderRes.json();
    const allFolders = new Map<string, {name: string, parent: string | undefined}>();
    folderData.files.forEach((f: any) => allFolders.set(f.id, {name: f.name, parent: f.parents?.[0]}));


    const notePromises = files
        .filter(file => file.name.endsWith('.txt'))
        .map(async (file): Promise<Note | null> => {
            try {
                const fileContent = await drive.getFileContent(accessToken, file.id);
                const path = await getFolderPathForFile(accessToken, file, allFolders);

                const match = fileContent.match(/---\n([\s\S]*?)\n---/);
                if (match) {
                    const frontMatter = parse(match[1]);
                    const content = fileContent.substring(match[0].length).trim();
                    // FIX: Property 'title' is missing in type '{ id: any; name: any; path: string[]; content: string; tags: any; date: any; summary: any; }' but required in type 'Note'.
                    return {
                        id: file.id,
                        name: file.name,
                        path,
                        content,
                        tags: frontMatter.tags || [],
                        date: frontMatter.date || file.createdTime,
                        title: frontMatter.title || file.name,
                        summary: frontMatter.summary || 'N/A'
                    };
                } else {
                    // FIX: Property 'title' is missing in type '{ id: any; name: any; path: string[]; content: string; tags: undefined[]; date: any; summary: string; }' but required in type 'Note'.
                     return {
                        id: file.id,
                        name: file.name,
                        path,
                        content: fileContent,
                        tags: [],
                        date: file.createdTime,
                        title: file.name,
                        summary: 'N/A'
                    };
                }
            } catch (error) {
                console.error(`Failed to process file ${file.name}:`, error);
                return null;
            }
        });

    const notes = (await Promise.all(notePromises)).filter((note): note is Note => note !== null);
    return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}