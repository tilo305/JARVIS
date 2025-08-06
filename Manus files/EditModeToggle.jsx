import { useState } from 'react';
import { Edit3, Eye } from 'lucide-react';

const EditModeToggle = ({ isEditMode, onToggle }) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          isEditMode
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600'
        }`}
      >
        {isEditMode ? (
          <>
            <Eye className="w-4 h-4" />
            <span>View Mode</span>
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" />
            <span>Edit Mode</span>
          </>
        )}
      </button>
      
      {isEditMode && (
        <div className="mt-2 bg-black/80 border border-blue-400/50 rounded-lg px-3 py-2 text-blue-300 text-sm max-w-xs">
          ✏️ Edit Mode Active - Click any text to edit. Changes are saved automatically.
        </div>
      )}
    </div>
  );
};

export default EditModeToggle;

