import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';
import TaskForm from '../forms/TaskForm';
import { Task } from '../../types';

const GanttView: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask } = useProject();
  const { timeScale } = useUI();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<'create' | 'edit'>('create');

  // 模擬甘特圖時間線資料
  const generateTimeScaleHeaders = () => {
    const today = new Date();
    const headers = [];
    
    switch (timeScale) {
      case 'day':
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          headers.push({
            key: date.toISOString().split('T')[0],
            label: date.getDate().toString(),
            sublabel: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
          });
        }
        break;
        
      case 'week':
        for (let i = 0; i < 12; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i * 7);
          headers.push({
            key: `week-${i}`,
            label: `第 ${i + 1} 週`,
            sublabel: `${date.getMonth() + 1}月`
          });
        }
        break;
        
      case 'month':
        for (let i = 0; i < 12; i++) {
          const date = new Date(today);
          date.setMonth(date.getMonth() + i);
          headers.push({
            key: `month-${i}`,
            label: `${date.getMonth() + 1}月`,
            sublabel: date.getFullYear().toString()
          });
        }
        break;
        
      case 'quarter':
        for (let i = 0; i < 4; i++) {
          const date = new Date(today);
          date.setMonth(date.getMonth() + i * 3);
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          headers.push({
            key: `quarter-${i}`,
            label: `Q${quarter}`,
            sublabel: date.getFullYear().toString()
          });
        }
        break;
    }
    
    return headers;
  };

  const timeHeaders = generateTimeScaleHeaders();

  // 處理新增任務
  const handleAddTask = () => {
    setTaskFormMode('create');
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  // 處理編輯任務
  const handleEditTask = (taskId: string) => {
    setTaskFormMode('edit');
    setSelectedTask(taskId);
    setShowTaskForm(true);
  };

  // 處理刪除任務
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('確定要刪除此任務嗎？')) {
      deleteTask(taskId);
    }
  };

  // 提交任務表單
  const handleTaskFormSubmit = (taskData: Partial<Task>) => {
    if (taskFormMode === 'create') {
      createTask(taskData);
    } else {
      if (selectedTask) {
        updateTask(selectedTask, taskData);
      }
    }
    setShowTaskForm(false);
  };

  // 生成隨機位置和寬度以便演示
  const getRandomPosition = () => {
    return {
      left: `${Math.floor(Math.random() * 60)}%`,
      width: `${Math.floor(Math.random() * 30) + 20}%`,
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 甘特圖工具列 */}
      <div className="bg-white border-b border-gray-200 p-2.5 flex items-center">
        <button
          onClick={handleAddTask}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors shadow-sm hover:shadow"
        >
          <Plus size={16} className="mr-1" />
          新增任務
        </button>
        
        <div className="ml-4 flex items-center text-sm text-gray-600">
          <span className="flex items-center mr-4">
            <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5"></div>
            進行中
          </span>
          <span className="flex items-center mr-4">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1.5"></div>
            已完成
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-1.5"></div>
            逾期
          </span>
        </div>
      </div>
      
      {/* 甘特圖主視圖 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 任務清單欄 */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-gray-100 p-3 font-medium text-gray-700 border-b border-gray-200 z-10">
            任務名稱
          </div>
          
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div 
                key={task.id}
                className="border-b border-gray-200 p-3 hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{task.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    進度: {task.progress}%
                  </div>
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Plus size={24} className="text-gray-400" />
              </div>
              沒有任務資料。點擊「新增任務」按鈕開始建立專案計劃。
            </div>
          )}
        </div>
        
        {/* 甘特圖時間軸區 */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          {/* 時間標題 */}
          <div className="sticky top-0 bg-gray-100 border-b border-gray-200 z-10">
            <div className="flex">
              {timeHeaders.map(header => (
                <div 
                  key={header.key}
                  className="flex-1 min-w-20 p-2 border-r border-gray-300 text-center"
                >
                  <div className="font-medium text-gray-700">{header.label}</div>
                  <div className="text-xs text-gray-500">{header.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 甘特圖時間格線 */}
          <div className="relative gantt-chart-container">
            {tasks.length > 0 ? (
              tasks.map(task => {
                const position = getRandomPosition();
                return (
                  <div key={task.id} className="flex relative h-[76px] border-b border-gray-200">
                    {/* 模擬任務條，實際應用中需要計算位置與寬度 */}
                    <div 
                      className={`absolute h-8 rounded-sm task-bar ${
                        task.progress === 100 
                          ? 'bg-green-500' 
                          : task.progress > 0 
                          ? 'bg-blue-500' 
                          : 'bg-gray-400'
                      } shadow-sm`}
                      style={{ 
                        left: position.left, 
                        top: '20px', 
                        width: position.width
                      }}
                    >
                      <div className="px-2 text-white text-sm overflow-hidden whitespace-nowrap h-full flex items-center">
                        {task.name}
                      </div>
                      
                      {/* 進度條 */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* 任務依賴線 - 這只是簡單示意 */}
                    {task.dependencies.length > 0 && (
                      <div className="absolute left-[40%] top-[24px] w-20 border-t-2 border-gray-400 border-dashed"></div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-32"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* 任務表單對話框 */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-slideInBottom">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {taskFormMode === 'create' ? '新增任務' : '編輯任務'}
            </h3>
            <TaskForm 
              mode={taskFormMode}
              taskId={selectedTask}
              onSubmit={handleTaskFormSubmit}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttView;