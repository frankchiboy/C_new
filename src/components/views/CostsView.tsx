import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import CostForm from '../forms/CostForm';
import { Cost } from '../../types';

const CostsView: React.FC = () => {
  const { costs, tasks, createCost, updateCost, deleteCost } = useProject();
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
    if (window.confirm('確定要刪除此成本紀錄嗎？')) {
      deleteCost(id);
    }
  };

  const handleSubmit = (data: Partial<Cost>) => {
    if (mode === 'create') {
      createCost(data);
    } else if (selected) {
      updateCost(selected, data);
    }
    setShowForm(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">成本管理</h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus size={16} className="mr-1" /> 新增成本
        </button>
      </div>

      {costs.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">任務</th>
              <th className="px-3 py-2 border-b text-left">金額</th>
              <th className="px-3 py-2 border-b text-left">類別</th>
              <th className="px-3 py-2 border-b text-left">狀態</th>
              <th className="px-3 py-2 border-b text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {costs.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  {tasks.find(t => t.id === c.taskId)?.name || '未指定'}
                </td>
                <td className="px-3 py-2">{c.amount}</td>
                <td className="px-3 py-2">{c.category}</td>
                <td className="px-3 py-2">{c.status === 'pending' ? '未付款' : '已付款'}</td>
                <td className="px-3 py-2 space-x-1">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
        <div className="p-8 text-center text-gray-500">尚未新增成本紀錄</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {mode === 'create' ? '新增成本' : '編輯成本'}
            </h3>
            <CostForm
              mode={mode}
              costId={selected}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CostsView;
