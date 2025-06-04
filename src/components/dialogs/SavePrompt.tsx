import React from 'react';
import { useProject } from '../../contexts/ProjectContext';

interface SavePromptProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const SavePrompt: React.FC<SavePromptProps> = ({ onConfirm, onCancel }) => {
  const { project, saveProject, saveProjectAs } = useProject();

  // 處理儲存動作
  const handleSave = async () => {
    if (project.isUntitled) {
      // 如果是未命名專案，先開啟另存為對話框
      // 簡化實作，這裡直接使用 prompt
      const name = prompt('請輸入專案名稱:', project.name);
      if (name) {
        await saveProjectAs(name);
        onConfirm();
      }
    } else {
      await saveProject();
      onConfirm();
    }
  };

  // 處理放棄變更
  const handleDiscard = () => {
    onConfirm();
  };

  // 處理取消
  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-slideInBottom">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          是否儲存變更？
        </h3>
        
        <p className="text-gray-600 mb-6">
          您對「{project.name || '未命名專案'}」做了修改，是否要儲存這些變更？
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            取消
          </button>
          
          <button
            onClick={handleDiscard}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            放棄變更
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePrompt;