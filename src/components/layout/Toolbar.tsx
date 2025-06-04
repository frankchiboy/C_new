import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, FilePlus, FolderOpen, Undo, Redo,
  Menu, ZoomIn, ZoomOut, Calendar, ChevronDown,
  Download, Printer, Settings, Camera, Clock
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';
import { ProjectState } from '../../types';

const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    project,
    createProject,
    saveProject,
    canUndo,
    canRedo,
    undo,
    redo,
    manualSnapshot
  } = useProject();
  const { toggleSidebar, timeScale, setTimeScale, openDialog } = useUI();

  // 處理新建專案
  const handleNewProject = () => {
    const newProject = createProject();
    navigate(`/project/${newProject.id}`);
  };

  // 處理儲存專案
  const handleSaveProject = async () => {
    if (project.isUntitled) {
      // 開啟命名對話框
      openDialog('saveAs');
    } else {
      await saveProject();
    }
  };

  // 處理另存新檔
  const handleSaveAs = () => {
    openDialog('saveAs');
  };

  const handleSnapshot = async () => {
    await manualSnapshot();
  };

  const handleShowSnapshots = () => {
    openDialog('snapshots');
  };

  // 處理開啟專案
  const handleOpenProject = () => {
    navigate('/');
  };

  // 處理時間尺度變更
  const handleTimeScaleChange = (scale: 'day' | 'week' | 'month' | 'quarter') => {
    setTimeScale(scale);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* 主工具列 */}
      <div className="flex items-center px-4 h-14">
        {/* 左側選單按鈕與應用標誌 */}
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="切換側邊欄"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center">
            <Calendar size={24} className="text-blue-700 mr-2" />
            <span className="text-lg font-semibold text-gray-900">ProjectCraft</span>
          </div>
        </div>
        
        {/* 檔案操作按鈕 */}
        <div className="flex ml-6 space-x-1">
          <button 
            onClick={handleNewProject}
            className="px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100 transition-colors"
          >
            <FilePlus size={18} className="mr-1.5" />
            新建
          </button>
          
          <button 
            onClick={handleOpenProject}
            className="px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100 transition-colors"
          >
            <FolderOpen size={18} className="mr-1.5" />
            開啟
          </button>
          
          <button 
            onClick={handleSaveProject}
            disabled={project.currentState !== ProjectState.DIRTY}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              project.currentState === ProjectState.DIRTY
                ? 'hover:bg-gray-100 text-gray-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} className="mr-1.5" />
            儲存
          </button>
          
          <div className="relative group">
            <button className="px-2 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100">
              <ChevronDown size={18} />
            </button>

            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block w-40">
              <button
                onClick={handleSaveAs}
                className="px-3 py-2 hover:bg-gray-100 text-sm w-full text-left flex items-center"
              >
                另存新檔...
              </button>
            </div>
          </div>

          <button
            onClick={handleSnapshot}
            className="px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100 transition-colors"
          >
            <Camera size={18} className="mr-1.5" />
            快照
          </button>
          <button
            onClick={handleShowSnapshots}
            className="px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100 transition-colors"
          >
            <Clock size={18} className="mr-1.5" />
            快照清單
          </button>
        </div>
        
        {/* 分隔線 */}
        <div className="mx-4 h-6 border-l border-gray-300"></div>
        
        {/* 編輯操作按鈕 */}
        <div className="flex space-x-1">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md ${
              canUndo ? 'hover:bg-gray-100 text-gray-800' : 'text-gray-400 cursor-not-allowed'
            }`}
            aria-label="撤消"
          >
            <Undo size={18} />
          </button>
          
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md ${
              canRedo ? 'hover:bg-gray-100 text-gray-800' : 'text-gray-400 cursor-not-allowed'
            }`}
            aria-label="重做"
          >
            <Redo size={18} />
          </button>
        </div>
        
        {/* 分隔線 */}
        <div className="mx-4 h-6 border-l border-gray-300"></div>
        
        {/* 視圖操作按鈕 */}
        <div className="flex space-x-1">
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="放大"
          >
            <ZoomIn size={18} />
          </button>
          
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="縮小"
          >
            <ZoomOut size={18} />
          </button>
          
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-gray-100 transition-colors">
              <span>{timeScale === 'day' ? '日' : timeScale === 'week' ? '週' : timeScale === 'month' ? '月' : '季'}</span>
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block w-32">
              <button 
                onClick={() => handleTimeScaleChange('day')}
                className={`px-3 py-2 hover:bg-gray-100 text-sm w-full text-left ${timeScale === 'day' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                日視圖
              </button>
              <button 
                onClick={() => handleTimeScaleChange('week')}
                className={`px-3 py-2 hover:bg-gray-100 text-sm w-full text-left ${timeScale === 'week' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                週視圖
              </button>
              <button 
                onClick={() => handleTimeScaleChange('month')}
                className={`px-3 py-2 hover:bg-gray-100 text-sm w-full text-left ${timeScale === 'month' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                月視圖
              </button>
              <button 
                onClick={() => handleTimeScaleChange('quarter')}
                className={`px-3 py-2 hover:bg-gray-100 text-sm w-full text-left ${timeScale === 'quarter' ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                季視圖
              </button>
            </div>
          </div>
        </div>
        
        {/* 右側按鈕 */}
        <div className="ml-auto flex space-x-1">
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="匯出"
          >
            <Download size={18} />
          </button>
          
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="列印"
          >
            <Printer size={18} />
          </button>
          
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="設定"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;