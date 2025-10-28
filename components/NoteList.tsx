
import React from 'react';
import { Note } from '../types';
import NoteItem from './NoteItem';
import CategoryHeader from './CategoryHeader';

interface NoteListProps {
  notes: Note[];
  onDeleteTag: (noteId: string, tag: string) => void;
  onEditNote: (noteId: string, newContent: string) => void;
  editingNoteId: string | null;
  onSetEditingNoteId: (id: string | null) => void;
  onTagClick: (tag: string) => void;
  onDeleteCategory: (category: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  onDeleteTag, 
  onEditNote, 
  editingNoteId, 
  onSetEditingNoteId,
  onTagClick,
  onDeleteCategory,
}) => {
  if (notes.length === 0) {
    return (
      <div className="p-8 text-center text-light-gray">
        No notes found for the current filter.
      </div>
    );
  }
  
  const { linkNotes, nonLinkNotes } = notes.reduce(
    (acc: {
        linkNotes: Record<string, Note[]>,
        nonLinkNotes: Record<string, Note[]>
    }, note) => {
        const key = note.path.join('/');
        if (note.link) {
            if (!acc.linkNotes[key]) {
                acc.linkNotes[key] = [];
            }
            acc.linkNotes[key].push(note);
        } else {
            if (!acc.nonLinkNotes[key]) {
                acc.nonLinkNotes[key] = [];
            }
            acc.nonLinkNotes[key].push(note);
        }
        return acc;
    },
    { linkNotes: {}, nonLinkNotes: {} }
  );

  const hasLinks = Object.keys(linkNotes).length > 0;
  const hasNonLinks = Object.keys(nonLinkNotes).length > 0;

  const renderCategoriesForGroup = (group: Record<string, Note[]>, type: 'link' | 'non-link') => (
    <div className="space-y-8">
      {Object.keys(group).map((category) => (
        <div key={`${type}-${category}`}>
          <CategoryHeader category={category} onDeleteCategory={onDeleteCategory} />
          <div className="mt-4 space-y-4">
            {group[category].map((note) => (
              <NoteItem 
                key={note.id} 
                note={note} 
                onDeleteTag={(tag) => onDeleteTag(note.id, tag)}
                onEditNote={onEditNote}
                isEditing={note.id === editingNoteId}
                onSetEditingNoteId={onSetEditingNoteId}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`p-4 md:p-8 grid grid-cols-1 gap-y-12 ${hasLinks && hasNonLinks ? 'lg:grid-cols-2 lg:gap-x-12 lg:items-start' : ''}`}>
      {hasLinks && (
        <section aria-labelledby="links-heading">
          <h2 id="links-heading" className="text-2xl font-bold mb-6 border-b-4 border-accent-black pb-2 text-off-black/80">
            LINKS
          </h2>
          {renderCategoriesForGroup(linkNotes, 'link')}
        </section>
      )}

      {hasNonLinks && (
        <section aria-labelledby="notes-heading">
           <h2 id="notes-heading" className="text-2xl font-bold mb-6 border-b-4 border-accent-black pb-2 text-off-black/80">
            NON-LINKS
          </h2>
          {renderCategoriesForGroup(nonLinkNotes, 'non-link')}
        </section>
      )}
    </div>
  );
};

export default NoteList;
