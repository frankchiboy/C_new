import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BarChart2, Users, DollarSign, AlertTriangle, FileText, Home } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';
import { ViewMode } from '../../types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { project, tasks } = useProject();
  const { activeView, setActiveView } = useUI();

  // 定義側邊欄選項
  const sidebarOptions = [
    { id: ViewMode.GANTT, label: '甘特圖', icon: <Calendar size={20} /> },
    { id: ViewMode.TASKS, label: '任務清單', icon: <FileText size={20} /> },
    { id: ViewMode.RESOURCES, label: '資源管理', icon: <Users size={20} /> },
    { id: ViewMode.COSTS, label: '成本追蹤', icon: <DollarSign size={20} /> },
    { id: ViewMode.RISKS, label: '風險管理', icon: <AlertTriangle size={20} /> },
    { id: ViewMode.DASHBOARD, label: '儀表板', icon: <BarChart2 size={20} /> },
  ];

  // 處理選項點擊
  const handleOptionClick = (view: ViewMode) => {
    setActiveView(view);
  };

  // 回到首頁
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col py-4">
      {/* 專案資訊區 */}
      <div className="px-4 pb-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {project.name || '未命名專案'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {tasks.length} 個任務
        </p>
      </div>

      {/* 導航選單 */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {sidebarOptions.map((option) => (
            <li key={option.id}>
              <button
                onClick={() => handleOptionClick(option.id)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  activeView === option.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{option.icon}</span>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部選項 */}
      <div className="mt-auto px-2 pb-2">
        <button
          onClick={goToHome}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Home size={20} className="mr-3" />
          回到首頁
        </button>
      </div>
    </div>
  );
};

export default Sidebar;