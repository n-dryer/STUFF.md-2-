
import React, { useState } from 'react';

interface CategoryHeaderProps {
  category: string;
  onDeleteCategory: (category: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, onDeleteCategory }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmDelete = () => {
    onDeleteCategory(category);
  };

  if (isConfirming) {
    return (
      <div className="border-b-2 border-off-black pb-2 animate-fade-in bg-accent-yellow/50 p-2 -m-2">
        <p className="text-sm font-bold text-off-black mb-2">Delete this category and all its items?</p>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleConfirmDelete} 
            className="text-sm font-bold uppercase text-accent-red hover:underline decoration-4 underline-offset-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
          >
            Confirm Delete
          </button>
          <button 
            onClick={() => setIsConfirming(false)} 
            className="text-sm text-light-gray uppercase hover:underline focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative border-b-2 border-off-black pb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold text-off-black transition-all duration-150 group-hover:font-extrabold group-hover:underline underline-offset-4 decoration-2">
            {category}
        </h2>
        <button 
            onClick={() => setIsConfirming(true)}
            aria-label={`Delete category ${category}`}
            className="ml-2 text-light-gray hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red"
        >
            <TrashIcon />
        </button>
    </div>
  );
};

export default CategoryHeader;