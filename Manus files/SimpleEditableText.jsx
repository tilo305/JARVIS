import React, { useState } from 'react';

const SimpleEditableText = ({ 
  value, 
  onSave, 
  placeholder = "Click to edit...",
  className = "",
  displayClassName = "",
  editClassName = "",
  multiline = false,
  ...props 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value || '');
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`inline-editing-container ${className}`}>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`w-full p-2 border border-blue-400 rounded bg-black/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${editClassName}`}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`w-full p-2 border border-blue-400 rounded bg-black/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editClassName}`}
            placeholder={placeholder}
          />
        )}
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 border border-blue-400 text-blue-400 text-sm rounded hover:bg-blue-500 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer hover:bg-blue-500/10 hover:border hover:border-blue-400/30 rounded p-1 transition-all duration-200 ${displayClassName}`}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
};

export default SimpleEditableText;

