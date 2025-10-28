
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Note, FeedbackState } from './types';
// import { signInWithGoogle, signOutUser, onAuthChange, firebaseConfig } from './services/firebase';
import { getCategorization } from './services/aiService';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';

// --- MOCK DATA FOR UI DEVELOPMENT ---
const MOCK_USER: User = {
  uid: 'mock-user-123',
  displayName: 'Dev User',
  email: 'dev@example.com',
  photoURL: '',
  providerId: 'google.com',
  accessToken: 'mock-token',
  // Required FirebaseUser properties
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};

const MOCK_NOTES: Note[] = [
  {
    id: '1',
    name: 'react_hooks_guide_20240101T120000Z.txt',
    path: ['Programming', 'JavaScript', 'React'],
    title: 'React Hooks Performance Tip',
    content: 'Remember to use useCallback for functions passed to memoized components.',
    tags: ['react', 'hooks', 'performance', 'optimization', 'frontend'],
    date: '2024-07-29T10:00:00Z',
    summary: 'A note about using the `useCallback` hook to optimize performance in React components.',
  },
  {
    id: '2',
    name: 'project_ideas_20240101T120500Z.txt',
    path: ['Ideas'],
    title: 'AI Note-Taking App Idea',
    content: 'A minimalist note-taking app with AI categorization. Store notes in user\'s own cloud storage.',
    tags: ['project', 'ideas', 'ai'],
    date: '2024-07-28T15:30:00Z',
    summary: 'An idea for a minimalist, AI-powered note-taking app that saves data to the user\'s personal cloud storage.',
  },
  {
    id: '4',
    name: 'cnn_link_20240730T090000Z.txt',
    path: ['News', 'Bookmarks'],
    title: 'CNN Homepage',
    content: 'https://www.cnn.com',
    tags: ['news', 'media', 'cnn'],
    date: '2024-07-30T09:00:00Z',
    summary: 'A bookmark to the main page of the CNN news website.',
    link: {
      url: 'https://www.cnn.com',
      title: 'CNN Homepage'
    }
  },
  {
    id: '3',
    name: 'grocery_list_20240101T12100Z.txt',
    path: ['Personal', 'Shopping'],
    title: 'Grocery List',
    content: 'Milk, bread, eggs, and coffee.',
    tags: ['groceries', 'shopping'],
    date: '2024-07-29T11:00:00Z',
    summary: 'A simple grocery list for the weekly shop.',
  },
];
// --- END MOCK DATA ---

// --- SUB-COMPONENTS ---
const AppHeader: React.FC<{
  isTipVisible: boolean;
  dismissOnboarding: () => void;
  noteInputRef: React.RefObject<HTMLTextAreaElement>;
  handleSaveNote: (content: string) => void;
  isSaving: boolean;
  feedback: FeedbackState | null;
}> = ({ isTipVisible, dismissOnboarding, noteInputRef, handleSaveNote, isSaving, feedback }) => (
  <header className="sticky top-0 bg-off-white z-10">
    <div className="p-4 md:px-8 border-b-2 border-accent-black">
      <h1 className="font-sans text-5xl font-extrabold text-accent-black inline-block hover:underline decoration-accent-black decoration-[6px] underline-offset-[12px] transition-all duration-150">STUFF.md</h1>
    </div>
    {isTipVisible && (
      <div className="p-2 md:px-8 border-b border-off-black bg-off-black text-off-white flex justify-between items-center">
        <p className="text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis">
          Tip: Press <kbd className="font-sans border px-1.5 py-0.5 text-xs">Enter</kbd> to save, <kbd className="font-sans border px-1.5 py-0.5 text-xs">Shift+Enter</kbd> for new line. Press <kbd className="font-sans border px-1.5 py-0.5 text-xs">/</kbd> to focus.
        </p>
        <button onClick={dismissOnboarding} className="flex-shrink-0 ml-4 text-sm hover:underline decoration-4 underline-offset-2 focus:underline focus:decoration-4 focus:underline-offset-2 focus:outline-none">DISMISS</button>
      </div>
    )}
    <NoteInput ref={noteInputRef} onSave={handleSaveNote} isSaving={isSaving} />
    {feedback && (
      <div className={`p-2 text-center text-sm ${feedback.type === 'error' ? 'text-accent-red font-semibold' : 'text-light-gray'}`}>
        {feedback.message}
      </div>
    )}
  </header>
);

const ActiveFilterBar: React.FC<{
  activeTagFilter: string | null;
  clearTagFilter: () => void;
}> = ({ activeTagFilter, clearTagFilter }) => {
  if (!activeTagFilter) return null;
  return (
    <div className="p-4 md:px-8 flex justify-between items-center border-b border-light-gray/50 bg-accent-yellow/20 animate-fade-in">
      <p className="font-mono">
        Filtering by tag: <span className="font-bold bg-accent-yellow text-off-black px-2 py-1">{activeTagFilter}</span>
      </p>
      <button onClick={clearTagFilter} className="text-sm font-bold uppercase hover:underline decoration-4 underline-offset-2 focus:underline focus:decoration-4 focus:underline-offset-2 p-1 -m-1 transition-all duration-150 focus:outline-none">Clear</button>
    </div>
  );
};

const AppFooter: React.FC<{
  hasDismissedTip: boolean;
  isTipVisible: boolean;
  showTip: () => void;
}> = ({ hasDismissedTip, isTipVisible, showTip }) => (
  <footer className="p-4 flex justify-between items-center text-center border-t border-light-gray/30">
    <div>
        <span className="text-sm text-light-gray">Development Mode</span>
    </div>
    {hasDismissedTip && !isTipVisible && (
        <button onClick={showTip} className="text-sm text-light-gray hover:text-off-black focus:text-off-black hover:underline decoration-4 underline-offset-2 focus:underline focus:decoration-4 focus:underline-offset-2 focus:outline-none">SHOW TIP</button>
    )}
  </footer>
);


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isTipVisible, setIsTipVisible] = useState(false);
  const [lastEditedNote, setLastEditedNote] = useState<{ noteId: string; previousState: Note } | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);


  const hasDismissedTip = localStorage.getItem('hasVisitedStUFF.md') === 'true';

  useEffect(() => {
    if (!hasDismissedTip) {
      setIsTipVisible(true);
    }
     return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [hasDismissedTip]);
  
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        noteInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('hasVisitedStUFF.md', 'true');
    setIsTipVisible(false);
  };
  
  const showTip = () => {
    setIsTipVisible(true);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setNotes(MOCK_NOTES);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDeleteTag = (noteId: string, tagToDelete: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            tags: note.tags.filter(tag => tag !== tagToDelete),
          };
        }
        return note;
      })
    );
  };

   const handleUndoEdit = () => {
    if (!lastEditedNote) return;

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    setNotes(prevNotes =>
        prevNotes.map(note =>
            note.id === lastEditedNote.noteId ? lastEditedNote.previousState : note
        )
    );

    setFeedback({ message: 'Changes undone.', type: 'info' });
    setLastEditedNote(null);

    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 2000);
  };

  const handleEditNote = async (noteId: string, newContent: string) => {
    setEditingNoteId(null);
    const originalNotes = [...notes];
    const noteToUpdate = originalNotes.find(n => n.id === noteId);
    if (!noteToUpdate) return;

    setLastEditedNote({ noteId, previousState: noteToUpdate });
    
    setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, content: newContent } : note
        )
    );
    setFeedback({ message: 'Re-analyzing note...', type: 'info' });

    const trimmedContent = newContent.trim();
    const isLink = /^https?:\/\/\S+$/.test(trimmedContent);
    
    try {
        const aiResult = await getCategorization(trimmedContent, '');

        setNotes(prevNotes =>
            prevNotes.map(note => {
                if (note.id === noteId) {
                    return {
                        ...note,
                        content: trimmedContent,
                        tags: aiResult?.tags || note.tags,
                        title: aiResult?.title || note.title,
                        summary: aiResult?.summary || note.summary,
                        link: isLink ? { url: trimmedContent, title: aiResult?.title || trimmedContent } : undefined,
                    };
                }
                return note;
            })
        );
         setFeedback({ 
            message: (
                <span>
                    Note updated. 
                    <button onClick={handleUndoEdit} className="ml-2 font-bold uppercase hover:underline focus:underline">Undo</button>
                </span>
            ), 
            type: 'success' 
        });
    } catch (error) {
        console.error("Error updating note:", error);
        setNotes(originalNotes);
        setFeedback({ message: 'Error updating note.', type: 'error' });
        setLastEditedNote(null);
    } finally {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = window.setTimeout(() => {
            setFeedback(null);
            setLastEditedNote(null);
        }, 5000);
    }
  };

  const handleSaveNote = async (content: string) => {
    if (!user) return;
    setIsSaving(true);
    setFeedback({ message: 'Analyzing with AI...', type: 'info' });

    const trimmedContent = content.trim();
    const isLink = /^https?:\/\/\S+$/.test(trimmedContent);

    try {
      const aiResult = await getCategorization(trimmedContent, '');
      
      const newNote: Note = {
        id: new Date().toISOString(),
        name: `${trimmedContent.substring(0, 20).replace(/\s/g, '_')}_${Date.now()}.txt`,
        path: aiResult?.categories?.length ? aiResult.categories : ['Uncategorized'],
        content: trimmedContent,
        tags: aiResult?.tags || [],
        date: new Date().toISOString(),
        title: aiResult?.title || (isLink ? trimmedContent : 'Untitled Note'),
        summary: aiResult?.summary || 'AI could not generate a summary.',
        link: isLink ? { url: trimmedContent, title: aiResult?.title || trimmedContent } : undefined,
      };
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setFeedback({ message: `Saved to ${newNote.path.join('/')}`, type: 'success' });
    } catch (error) {
      console.error("Error saving note with AI:", error);
      const newNote: Note = {
        id: new Date().toISOString(),
        name: `${trimmedContent.substring(0, 20).replace(/\s/g, '_')}_${Date.now()}.txt`,
        path: ['Uncategorized'],
        content: trimmedContent,
        tags: ['error'],
        date: new Date().toISOString(),
        title: isLink ? trimmedContent : 'Untitled Note',
        summary: 'AI analysis failed. Note saved without categorization.',
        link: isLink ? { url: trimmedContent, title: trimmedContent } : undefined,
      };
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setFeedback({ message: 'AI failed. Saved to Uncategorized.', type: 'error' });
    } finally {
      setIsSaving(false);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleTagClick = (tag: string) => {
    setActiveTagFilter(prev => (prev === tag ? null : tag));
  };

  const clearTagFilter = () => {
    setActiveTagFilter(null);
  };
  
  const handleDeleteCategory = useCallback((categoryToDelete: string) => {
    const notesInCategory = notes.filter(note => note.path.join('/') === categoryToDelete);
    if (notesInCategory.length === 0) return;

    setNotes(prevNotes => 
      prevNotes.filter(note => note.path.join('/') !== categoryToDelete)
    );

    setFeedback({ 
      message: `Deleted category "${categoryToDelete}" and ${notesInCategory.length} note(s).`, 
      type: 'success' 
    });

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 4000);
  }, [notes]);

  const filteredNotes = activeTagFilter
    ? notes.filter(note => note.tags.includes(activeTagFilter))
    : notes;

  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        isTipVisible={isTipVisible}
        dismissOnboarding={dismissOnboarding}
        noteInputRef={noteInputRef}
        handleSaveNote={handleSaveNote}
        isSaving={isSaving}
        feedback={feedback}
      />
      <ActiveFilterBar activeTagFilter={activeTagFilter} clearTagFilter={clearTagFilter} />
      <main className="flex-grow">
        {isLoading ? (
          <p className="p-8 text-center text-light-gray">Loading notes...</p>
        ) : (
          <NoteList 
            notes={filteredNotes} 
            onDeleteTag={handleDeleteTag} 
            onEditNote={handleEditNote}
            editingNoteId={editingNoteId}
            onSetEditingNoteId={setEditingNoteId}
            onTagClick={handleTagClick}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>
      <AppFooter
        hasDismissedTip={hasDismissedTip}
        isTipVisible={isTipVisible}
        showTip={showTip}
      />
    </div>
  );
};

export default App;