import React, { useEffect, useState } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useProject } from '../../contexts/ProjectContext';

interface TemplateInfo {
  id: string;
  name: string;
  file: string;
}

const TemplateDialog: React.FC = () => {
  const { closeDialog } = useUI();
  const { createProject, loadProjectData } = useProject();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/templates/index.json');
        const list: TemplateInfo[] = await res.json();
        setTemplates(list);
      } catch (err) {
        console.error('載入範本失敗', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleUse = async (file: string) => {
    try {
      const res = await fetch(`/templates/${file}`);
      const data = await res.json();
      const project = createProject(data.project.name);
      // 設定其他資料
      loadProjectData({
        project: { ...project, description: data.project.description },
        tasks: data.tasks || [],
        resources: data.resources || [],
        costs: data.costs || [],
        risks: data.risks || []
      });
      closeDialog();
    } catch (err) {
      console.error('載入範本檔案失敗', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-slideInBottom">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇範本</h3>
        {loading ? (
          <div className="p-4 text-center text-gray-500">載入中...</div>
        ) : templates.length > 0 ? (
          <ul className="space-y-2">
            {templates.map(t => (
              <li key={t.id} className="flex items-center justify-between">
                <span>{t.name}</span>
                <button onClick={() => handleUse(t.file)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">使用</button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">沒有可用的範本</div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={closeDialog} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">關閉</button>
        </div>
      </div>
    </div>
  );
};

export default TemplateDialog;
