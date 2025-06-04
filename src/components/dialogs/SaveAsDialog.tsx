import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';

const SaveAsDialog: React.FC = () => {
  const { project, saveProjectAs } = useProject();
  const { closeDialog } = useUI();
  const [name, setName] = useState(project.name || '');

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveProjectAs(name.trim());
    closeDialog();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-slideInBottom">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">另存新檔</h3>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={closeDialog}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveAsDialog;
