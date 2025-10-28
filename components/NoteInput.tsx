import React, { useState, forwardRef } from 'react';
import BrutalistSpinner from './BrutalistSpinner';

interface NoteInputProps {
  onSave: (content: string) => void;
  isSaving: boolean;
}

const NoteInput = forwardRef<HTMLTextAreaElement, NoteInputProps>(({ onSave, isSaving }, ref) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() && !isSaving) {
        onSave(content.trim());
        setContent('');
      }
    }
  };

  // By switching from the `rows` attribute to dynamic height classes, we leverage
  // CSS transitions for a smoother user experience when the input field resizes.
  const heightClass = isFocused ? 'h-24' : 'h-16'; // h-16 is ~1 line, h-24 is ~2 lines

  return (
    <div className="p-4 md:px-8 border-b border-off-black">
      <div className="relative group">
        <div className="relative border-2 border-accent-black bg-off-white group-hover:border-[5px] focus-within:border-[5px] transition-all duration-150">
          <textarea
            ref={ref}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isSaving ? '' : "Type or paste anything..."}
            className={`w-full bg-transparent p-4 outline-none resize-none font-mono text-2xl placeholder:text-light-gray transition-all duration-150 ${heightClass}`}
            disabled={isSaving}
          />
          {isSaving && <BrutalistSpinner />}
        </div>
      </div>
    </div>
  );
});

NoteInput.displayName = 'NoteInput';

export default NoteInput;