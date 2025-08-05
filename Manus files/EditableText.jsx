import React from 'react';
import EasyEdit, { Types } from 'react-easy-edit';

const EditableText = ({ 
  value, 
  onSave, 
  type = Types.TEXT, 
  placeholder = "Click to edit...",
  className = "",
  displayClassName = "",
  editClassName = "",
  saveButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
  instructions = "Click to edit",
  multiline = false,
  ...props 
}) => {
  const handleSave = (newValue) => {
    if (onSave) {
      onSave(newValue);
    }
  };

  const handleCancel = () => {
    // Optional: Add cancel logic if needed
    console.log('Edit cancelled');
  };

  // Custom styling for the edit and display components
  const customEditComponent = (props) => {
    if (multiline) {
      return (
        <textarea
          {...props}
          className={`w-full p-2 border border-blue-400 rounded bg-black/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editClassName}`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        {...props}
        className={`w-full p-2 border border-blue-400 rounded bg-black/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editClassName}`}
        placeholder={placeholder}
      />
    );
  };

  const customDisplayComponent = (props) => {
    return (
      <div
        {...props}
        className={`cursor-pointer hover:bg-blue-500/10 hover:border hover:border-blue-400/30 rounded p-1 transition-all duration-200 ${displayClassName}`}
        title={instructions}
      >
        {props.value || placeholder}
      </div>
    );
  };

  const customSaveButton = (props) => (
    <button
      {...props}
      className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
    >
      {saveButtonLabel}
    </button>
  );

  const customCancelButton = (props) => (
    <button
      {...props}
      className="ml-2 px-3 py-1 border border-blue-400 text-blue-400 text-sm rounded hover:bg-blue-500 hover:text-white transition-all duration-200"
    >
      {cancelButtonLabel}
    </button>
  );

  return (
    <div className={className}>
      <EasyEdit
        type={multiline ? Types.TEXTAREA : type}
        value={value}
        onSave={handleSave}
        onCancel={handleCancel}
        saveButtonLabel={saveButtonLabel}
        cancelButtonLabel={cancelButtonLabel}
        attributes={{ name: "editable-text" }}
        instructions={instructions}
        editComponent={customEditComponent}
        displayComponent={customDisplayComponent}
        saveButtonComponent={customSaveButton}
        cancelButtonComponent={customCancelButton}
        {...props}
      />
    </div>
  );
};

export default EditableText;

