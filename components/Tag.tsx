import React, { useState } from 'react';

interface TagProps {
  tag: string;
  onDelete: (tag: string) => void;
  onClick: (tag: string) => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


const Tag: React.FC<TagProps> = ({ tag, onDelete, onClick }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent onClick on the parent from firing
    setIsDeleting(true);
    setTimeout(() => {
        onDelete(tag);
    }, 150); // Match animation duration
  };

  return (
    <div 
      className={`group/tag relative inline-flex items-center transition-all duration-150 ${isDeleting ? 'flash-delete-btn' : ''}`}
    >
      <button 
        onClick={() => onClick(tag)}
        className="px-2 py-0.5 text-sm uppercase font-mono border-b-2 border-off-black text-off-black bg-off-white hover:border-accent-black hover:font-bold cursor-pointer select-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-black focus-visible:ring-offset-1"
      >
        {tag}
      </button>
      <button 
        onClick={handleDelete} 
        aria-label={`Delete tag ${tag}`}
        className="ml-1 p-0.5 text-light-gray hover:text-accent-red opacity-0 group-hover/tag:opacity-100 transition-opacity duration-150 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red"
      >
        <XIcon />
      </button>
    </div>
  );
};

export default Tag;