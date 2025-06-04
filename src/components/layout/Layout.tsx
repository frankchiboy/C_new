import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import SavePrompt from '../dialogs/SavePrompt';
import SaveAsDialog from '../dialogs/SaveAsDialog';
import { ProjectState } from '../../types';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { project } = useProject();
  const { sidebarCollapsed, activeDialog } = useUI();
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // 監聽路由變化
  useEffect(() => {
    if (
      project.currentState === ProjectState.DIRTY && 
      location.pathname !== `/project/${project.id}` &&
      project.id
    ) {
      setShowSavePrompt(true);
    }
  }, [location, project]);

  // 處理確認離開
  const handleConfirmNavigation = () => {
    setShowSavePrompt(false);
  };

  // 處理取消離開
  const handleCancelNavigation = () => {
    setShowSavePrompt(false);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 側邊欄 */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-64'} transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 bg-white`}>
          <Sidebar />
        </div>
        
        {/* 主要內容區 */}
        <div className="flex-1 overflow-hidden flex flex-col animate-fadeIn">
          <Outlet />
        </div>
      </div>
      
      <StatusBar />
      
      {/* 儲存提示對話框 */}
      {showSavePrompt && (
        <SavePrompt
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        />
      )}

      {/* 另存新檔對話框 */}
      {activeDialog === 'saveAs' && <SaveAsDialog />}
    </div>
  );
};

export default Layout;