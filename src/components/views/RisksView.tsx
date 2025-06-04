import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import RiskForm from '../forms/RiskForm';
import { Risk } from '../../types';

const RisksView: React.FC = () => {
  const { risks, createRisk, updateRisk, deleteRisk } = useProject();
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
    if (window.confirm('確定要刪除此風險紀錄嗎？')) {
      deleteRisk(id);
    }
  };

  const handleSubmit = (data: Partial<Risk>) => {
    if (mode === 'create') {
      createRisk(data);
    } else if (selected) {
      updateRisk(selected, data);
    }
    setShowForm(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">風險管理</h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus size={16} className="mr-1" /> 新增風險
        </button>
      </div>

      {risks.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">標題</th>
              <th className="px-3 py-2 border-b text-left">衝擊</th>
              <th className="px-3 py-2 border-b text-left">可能性</th>
              <th className="px-3 py-2 border-b text-left">狀態</th>
              <th className="px-3 py-2 border-b text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {risks.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.impactLevel}</td>
                <td className="px-3 py-2">{r.probability}</td>
                <td className="px-3 py-2">
                  {r.status === 'open' ? '開啟' : r.status === 'mitigated' ? '已緩解' : '已關閉'}
                </td>
                <td className="px-3 py-2 space-x-1">
                  <button
                    onClick={() => handleEdit(r.id)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
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
        <div className="p-8 text-center text-gray-500">尚未新增風險紀錄</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {mode === 'create' ? '新增風險' : '編輯風險'}
            </h3>
            <RiskForm
              mode={mode}
              riskId={selected}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RisksView;
