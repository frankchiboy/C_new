import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  FolderOpen,
  Clock,
  FileCheck
} from 'lucide-react';
import { useFileSystem } from '../contexts/FileSystemContext';
import { useProject } from '../contexts/ProjectContext';
import { RecentProject } from '../types';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getRecentProjects, importFile } = useFileSystem();
  const { createProject, loadProject } = useProject();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入最近專案清單
  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const projects = await getRecentProjects();
        setRecentProjects(projects);
      } catch (error) {
        console.error('載入最近專案失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentProjects();
  }, [getRecentProjects]);

  // 處理新建專案
  const handleCreateProject = () => {
    const newProject = createProject();
    navigate(`/project/${newProject.id}`);
  };

  // 從最近清單開啟專案
  const handleOpenProject = async (projectId: string) => {
    try {
      const success = await loadProject(projectId);
      if (success) {
        navigate(`/project/${projectId}`);
      } else {
        alert('無法載入專案，可能已被刪除或已損毀。');
      }
    } catch (error) {
      console.error('開啟專案時發生錯誤:', error);
      alert('開啟專案時發生錯誤。');
    }
  };

  // 處理從檔案匯入
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await importFile(file);
      if (data) {
        await loadProject(data.project.id);
        navigate(`/project/${data.project.id}`);
      } else {
        alert('檔案格式無效或已損毀。');
      }
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 animate-fadeIn">
      <div className="max-w-4xl w-full px-6 py-8 bg-white rounded-lg shadow-lg">
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Calendar size={48} className="text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">歡迎使用 ProjectCraft</h1>
          <p className="mt-2 text-gray-600">
            專業的離線專案管理工具，專為個人與小型團隊設計
          </p>
        </div>

        {/* 主要操作區 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 新建專案 */}
          <button
            onClick={handleCreateProject}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors transform hover:scale-105 hover:shadow-md"
          >
            <Plus size={36} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">新建專案</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              從零開始建立一個新的專案計劃
            </p>
        </button>

        {/* 開啟專案 */}
        <button
          onClick={handleOpenFileClick}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors transform hover:scale-105 hover:shadow-md"
          >
            <FolderOpen size={36} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">開啟專案</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              從本機開啟現有的專案檔案
            </p>
        </button>
        <input
          type="file"
          accept=".mpproj,.json"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 使用範本 */}
        <button
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors transform hover:scale-105 hover:shadow-md"
          >
            <FileCheck size={36} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">使用範本</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              從預設範本快速開始您的專案
            </p>
          </button>
        </div>

        {/* 最近專案清單 */}
        <div>
          <div className="flex items-center mb-4">
            <Clock size={20} className="text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">最近專案</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">正在載入最近專案...</div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <div
                  key={project.projectUUID}
                  onClick={() => handleOpenProject(project.projectUUID)}
                  className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-medium text-gray-900 truncate">{project.fileName}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    上次開啟: {new Date(project.openedAt).toLocaleString('zh-TW')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              沒有最近的專案記錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;