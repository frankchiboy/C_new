import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { ProjectState } from '../../types';

const StatusBar: React.FC = () => {
  const { project, tasks } = useProject();
  
  // 計算專案統計資訊
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.progress === 100).length;
  const inProgressTasks = tasks.filter(task => task.progress > 0 && task.progress < 100).length;
  const notStartedTasks = tasks.filter(task => task.progress === 0).length;
  
  // 計算專案進度百分比
  const projectProgress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // 獲取專案狀態文字
  const getStatusText = () => {
    switch (project.currentState) {
      case ProjectState.UNINITIALIZED:
        return '未初始化';
      case ProjectState.UNTITLED:
        return '未命名專案';
      case ProjectState.EDITING:
        return '編輯中';
      case ProjectState.DIRTY:
        return '未儲存變更';
      case ProjectState.SAVED:
        return '已儲存';
      case ProjectState.CLOSING:
        return '關閉中';
      default:
        return '';
    }
  };
  
  // 獲取狀態顏色
  const getStatusColor = () => {
    switch (project.currentState) {
      case ProjectState.DIRTY:
        return 'text-amber-600';
      case ProjectState.SAVED:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-100 border-t border-gray-200 py-1 px-4 text-sm flex items-center text-gray-700">
      {/* 左側 - 專案狀態 */}
      <div className="flex items-center">
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {/* 中間 - 分隔符 */}
      <div className="mx-4 h-4 border-l border-gray-300"></div>
      
      {/* 任務統計 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <AlertCircle size={14} className="text-gray-500 mr-1.5" />
          <span>未開始: {notStartedTasks}</span>
        </div>
        
        <div className="flex items-center">
          <Clock size={14} className="text-blue-500 mr-1.5" />
          <span>進行中: {inProgressTasks}</span>
        </div>
        
        <div className="flex items-center">
          <CheckCircle2 size={14} className="text-green-500 mr-1.5" />
          <span>已完成: {completedTasks}</span>
        </div>
      </div>
      
      {/* 右側 - 專案進度 */}
      <div className="ml-auto flex items-center">
        <span className="mr-2">專案進度: {projectProgress}%</span>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${projectProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;