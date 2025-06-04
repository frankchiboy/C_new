import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import TaskForm from '../forms/TaskForm';
import { Task } from '../../types';

const TasksView: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask } = useProject();
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setMode('create');
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setMode('edit');
    setSelected(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此任務嗎？')) {
      deleteTask(id);
    }
  };

  const handleSubmit = (data: Partial<Task>) => {
    if (mode === 'create') {
      createTask(data);
    } else if (selected) {
      updateTask(selected, data);
    }
    setShowForm(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">任務清單</h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus size={16} className="mr-1" /> 新增任務
        </button>
      </div>

      {tasks.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">名稱</th>
              <th className="px-3 py-2 border-b text-left">開始</th>
              <th className="px-3 py-2 border-b text-left">結束</th>
              <th className="px-3 py-2 border-b text-left">進度</th>
              <th className="px-3 py-2 border-b text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2">{new Date(t.startDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">{new Date(t.endDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">{t.progress}%</td>
                <td className="px-3 py-2 space-x-1">
                  <button
                    onClick={() => handleEdit(t.id)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-gray-500">尚未建立任何任務</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {mode === 'create' ? '新增任務' : '編輯任務'}
            </h3>
            <TaskForm
              mode={mode}
              taskId={selected}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
