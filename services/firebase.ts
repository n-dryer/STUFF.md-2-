// import { initializeApp } from 'firebase/app';
// import { 
//   getAuth, 
//   GoogleAuthProvider, 
//   signInWithPopup, 
//   signOut,
//   onAuthStateChanged,
//   User as FirebaseUser,
// } from 'firebase/auth';
// import { User } from '../types';

// // -----------------------------------------------------------------------------
// // IMPORTANT: ACTION REQUIRED
// // -----------------------------------------------------------------------------
// // To fix the "Firebase: Error (auth/api-key-not-valid)" error, you must
// // replace the placeholder values below with your actual Firebase project
// // configuration.
// //
// // How to get your Firebase config:
// // 1. Go to the Firebase console: https://console.firebase.google.com/
// // 2. Create a new project or select an existing one.
// // 3. In your project, go to Project Settings (click the gear icon).
// // 4. Under the "General" tab, scroll down to "Your apps".
// // 5. If you don't have a web app, click the "</>" icon to add one.
// // 6. Find and copy the `firebaseConfig` object.
// // 7. Paste it here to replace the placeholder object below.
// // -----------------------------------------------------------------------------
// export const firebaseConfig = {
//   apiKey: "PASTE_YOUR_API_KEY_HERE",
//   authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
//   projectId: "PASTE_YOUR_PROJECT_ID_HERE",
//   storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
//   messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
//   appId: "PASTE_YOUR_APP_ID_HERE"
// };


// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

// const provider = new GoogleAuthProvider();
// // Request the necessary scope to read/write files created by this app.
// provider.addScope('https://www.googleapis.com/auth/drive.file');

// export const signInWithGoogle = async (): Promise<User | null> => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const credential = GoogleAuthProvider.credentialFromResult(result);
//     if (credential?.accessToken) {
//       const accessToken = credential.accessToken;
//       const user: User = { ...result.user, accessToken };
//       return user;
//     }
//     console.error("Could not get access token from credential.");
//     return null;
//   } catch (error) {
//     console.error("Authentication error:", error);
//     return null;
//   }
// };

// export const signOutUser = (): Promise<void> => {
//     return signOut(auth);
// }

// // This listener now only reports the raw Firebase auth state.
// // It avoids the original implementation's bug of causing a login popup on every page load.
// // The main App component will handle the logic of initiating sign-in to get the Google Drive access token.
// export const onAuthChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
//     return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
//         callback(user);
//     });
// };
