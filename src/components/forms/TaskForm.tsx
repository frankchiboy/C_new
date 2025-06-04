import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BarChart2, FileText } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import dayjs from 'dayjs';
import { Task, TaskType, DependencyType } from '../../types';

interface TaskFormProps {
  mode: 'create' | 'edit';
  taskId: string | null;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ mode, taskId, onSubmit, onCancel }) => {
  const { tasks } = useProject();
  
  // 表單初始狀態
  const initialState = {
    name: '',
    parentId: null as string | null,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    duration: 1,
    progress: 0,
    assigneeIds: [] as string[],
    dependencies: [] as { taskId: string, type: DependencyType, lag: number }[],
    type: TaskType.STANDARD,
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialState);
  
  // 如果是編輯模式，載入任務資料
  useEffect(() => {
    if (mode === 'edit' && taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setFormData({
          name: task.name,
          parentId: task.parentId,
          startDate: dayjs(task.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(task.endDate).format('YYYY-MM-DD'),
          duration: task.duration,
          progress: task.progress,
          assigneeIds: task.assigneeIds,
          dependencies: task.dependencies,
          type: task.type as TaskType,
          notes: task.notes
        });
      }
    }
  }, [mode, taskId, tasks]);
  
  // 處理表單輸入變更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 處理數值輸入變更
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };
  
  // 處理起始日期變更
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setFormData(prev => {
      const newEndDate = dayjs(startDate).add(prev.duration, 'day').format('YYYY-MM-DD');
      return { ...prev, startDate, endDate: newEndDate };
    });
  };
  
  // 處理結束日期變更
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    setFormData(prev => {
      const days = dayjs(endDate).diff(dayjs(prev.startDate), 'day');
      return { ...prev, endDate, duration: days > 0 ? days : 1 };
    });
  };
  
  // 處理持續時間變更
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseInt(e.target.value);
    if (!isNaN(duration) && duration > 0) {
      setFormData(prev => {
        const newEndDate = dayjs(prev.startDate).add(duration, 'day').format('YYYY-MM-DD');
        return { ...prev, duration, endDate: newEndDate };
      });
    }
  };
  
  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 任務名稱 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          任務名稱
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      {/* 任務類型 */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          任務類型
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={TaskType.STANDARD}>標準任務</option>
          <option value={TaskType.MILESTONE}>里程碑</option>
          <option value={TaskType.BUFFER}>緩衝時間</option>
        </select>
      </div>
      
      {/* 父任務選擇 */}
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
          父任務
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">無父任務</option>
          {tasks
            .filter(t => t.id !== taskId) // 排除自己
            .map(task => (
              <option key={task.id} value={task.id}>{task.name}</option>
            ))
          }
        </select>
      </div>
      
      {/* 日期與時間 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            開始日期
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleStartDateChange}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            結束日期
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-500" />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleEndDateChange}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
      
      {/* 持續時間與進度 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            持續時間（天）
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock size={16} className="text-gray-500" />
            </div>
            <input
              type="number"
              id="duration"
              name="duration"
              min="1"
              value={formData.duration}
              onChange={handleDurationChange}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
            完成進度（%）
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BarChart2 size={16} className="text-gray-500" />
            </div>
            <input
              type="number"
              id="progress"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleNumberChange}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* 備註 */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          備註
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText size={16} className="text-gray-500" />
          </div>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>
      
      {/* 按鈕區 */}
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {mode === 'create' ? '建立' : '更新'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;