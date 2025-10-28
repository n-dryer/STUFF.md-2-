import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import Tag from './Tag';
import DateDisplay from './DateDisplay';

interface NoteItemProps {
  note: Note;
  onDeleteTag: (tag: string) => void;
  onEditNote: (noteId: string, newContent: string) => void;
  isEditing: boolean;
  onSetEditingNoteId: (id: string | null) => void;
  onTagClick: (tag: string) => void;
}

const SparkleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0L9.88886 6.11114L16 8L9.88886 9.88886L8 16L6.11114 9.88886L0 8L6.11114 6.11114L8 0Z" />
    </svg>
);

const NoteItem: React.FC<NoteItemProps> = ({ note, onDeleteTag, onEditNote, isEditing, onSetEditingNoteId, onTagClick }) => {
  const [editedContent, setEditedContent] = useState(note.content);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isMoreTagsVisible, setIsMoreTagsVisible] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const moreTagsRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (editedContent.trim() && editedContent.trim() !== note.content) {
      onEditNote(note.id, editedContent.trim());
    }
    onSetEditingNoteId(null);
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    onSetEditingNoteId(null);
  };
  
  const startEditing = () => {
    if(!isNoteExpanded) setIsNoteExpanded(true);
    onSetEditingNoteId(note.id);
  };

  useEffect(() => {
    if (!isEditing) {
      setEditedContent(note.content);
    }
  }, [isEditing, note.content]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      textAreaRef.current.focus();
    }
  }, [isEditing, editedContent]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (moreTagsRef.current && !moreTagsRef.current.contains(event.target as Node)) {
            setIsMoreTagsVisible(false);
        }
    };

    if (isMoreTagsVisible) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreTagsVisible]);

  return (
    <div className={`group relative border-b pb-4 transition-all duration-150 ${isNoteExpanded ? 'border-light-gray/50' : 'border-light-gray/50 hover:border-b-4 hover:border-accent-black'}`}>
      <div 
        className="flex justify-between items-start cursor-pointer" 
        onClick={() => setIsNoteExpanded(!isNoteExpanded)}
      >
        {note.link ? (
            <a
              href={note.link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-lg mb-2 pr-2 font-semibold transition-all duration-150 hover:opacity-75"
            >
              {note.title}
            </a>
          ) : (
            <p
              className="font-mono text-lg mb-2 pr-2 font-semibold"
              title={note.title}
            >
              {note.title}
            </p>
        )}
        <span className="text-light-gray transition-transform duration-200 pt-1" style={{ transform: isNoteExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'>'}</span>
      </div>

      {isNoteExpanded && (
        <div className="animate-fade-in">
          {note.summary && (
            <div className="flex items-start gap-2 text-base text-off-black/80 mb-3 p-2 -m-2 bg-accent-blue rounded-sm">
                <span title="AI Generated Summary" className="flex-shrink-0 mt-1 opacity-70">
                    <SparkleIcon />
                </span>
                <p className="italic">
                    {note.summary}
                </p>
            </div>
          )}
          {isEditing ? (
            <div>
              <textarea
                ref={textAreaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleSave}
                className="w-full bg-off-black/5 p-2 -m-2 border-2 border-accent-black outline-none resize-none font-mono text-base leading-snug focus:border-[5px] transition-all duration-150"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button onClick={handleSave} className="text-sm font-bold uppercase hover:underline decoration-4 underline-offset-2 focus:underline focus:decoration-4 focus:underline-offset-2 p-1 -m-1 transition-all duration-150 focus:outline-none">Save</button>
                <button onClick={handleCancel} className="text-sm text-light-gray uppercase hover:underline decoration-4 underline-offset-2 focus:underline focus:decoration-4 focus:underline-offset-2 focus:outline-none">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="relative cursor-pointer" onClick={startEditing}>
              {note.link ? (
                 <p className="text-base text-off-black/70 transition-colors duration-150 group-hover:bg-off-black/5 p-2 -m-2">
                   {note.content}
                 </p>
              ) : (
                <p className="text-base text-off-black transition-colors duration-150 group-hover:bg-off-black/5 p-2 -m-2 group-hover:underline decoration-light-gray/50 underline-offset-4">
                  {note.content}
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {note.tags.slice(0, 3).map((tag) => (
                <Tag 
                  key={tag} 
                  tag={tag} 
                  onDelete={() => onDeleteTag(tag)}
                  onClick={onTagClick}
                />
              ))}
              {note.tags.length > 3 && (
                <div className="relative" ref={moreTagsRef}>
                  <span 
                    className="text-sm text-light-gray cursor-pointer font-mono select-none"
                    onClick={() => setIsMoreTagsVisible(prev => !prev)}
                  >
                    +{note.tags.length - 3} more
                  </span>
                  {isMoreTagsVisible && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-accent-yellow text-off-black border-[3px] border-off-black z-10 w-max animate-fade-in">
                      <div className="flex flex-col items-start gap-1">
                        {note.tags.slice(3).map(tag => (
                            <Tag 
                              key={tag} 
                              tag={tag} 
                              onDelete={() => onDeleteTag(tag)}
                              onClick={onTagClick}
                            />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DateDisplay date={note.date} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteItem;