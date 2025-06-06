import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useUI } from '../contexts/UIContext';
import GanttView from '../components/views/GanttView';
import TasksView from '../components/views/TasksView';
import ResourcesView from '../components/views/ResourcesView';
import CostsView from '../components/views/CostsView';
import RisksView from '../components/views/RisksView';
import DashboardView from '../components/views/DashboardView';
import { ViewMode } from '../types';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loadProject, createProject } = useProject();
  const { activeView } = useUI();
  const [loading, setLoading] = useState(true);

  // 載入專案資料
  useEffect(() => {
    const initializeProject = async () => {
      setLoading(true);
      
      if (id) {
        // 嘗試載入現有專案
        const success = await loadProject(id);
        if (!success) {
          // 如果載入失敗，創建新專案
          createProject();
        }
      } else {
        // 沒有ID參數，創建新專案
        createProject();
      }
      
      setLoading(false);
    };
    
    initializeProject();
  }, [id, loadProject, createProject]);

  // 根據目前視圖類型選擇組件
  const renderActiveView = () => {
    if (loading) {
      return <div className="flex-1 flex items-center justify-center">載入中...</div>;
    }
    
    switch (activeView) {
      case ViewMode.GANTT:
        return <GanttView />;
      case ViewMode.TASKS:
        return <TasksView />;
      case ViewMode.RESOURCES:
        return <ResourcesView />;
      case ViewMode.COSTS:
        return <CostsView />;
      case ViewMode.RISKS:
        return <RisksView />;
      case ViewMode.DASHBOARD:
        return <DashboardView />;
      default:
        return <GanttView />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderActiveView()}
    </div>
  );
};

export default ProjectPage;