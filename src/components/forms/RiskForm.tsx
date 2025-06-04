import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useProject } from '../../contexts/ProjectContext';
import { RiskLevel, RiskStatus, Risk } from '../../types';

interface RiskFormProps {
  mode: 'create' | 'edit';
  riskId: string | null;
  onSubmit: (data: Partial<Risk>) => void;
  onCancel: () => void;
}

const RiskForm: React.FC<RiskFormProps> = ({ mode, riskId, onSubmit, onCancel }) => {
  const { risks, tasks } = useProject();
  const initialState = {
    taskId: '',
    identifiedAt: dayjs().format('YYYY-MM-DD'),
    title: '',
    description: '',
    impactLevel: RiskLevel.MEDIUM as RiskLevel,
    probability: RiskLevel.MEDIUM as RiskLevel,
    mitigationPlan: '',
    status: RiskStatus.OPEN as RiskStatus
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (mode === 'edit' && riskId) {
      const risk = risks.find(r => r.id === riskId);
      if (risk) {
        setFormData({
          taskId: risk.taskId,
          identifiedAt: dayjs(risk.identifiedAt).format('YYYY-MM-DD'),
          title: risk.title,
          description: risk.description,
          impactLevel: risk.impactLevel,
          probability: risk.probability,
          mitigationPlan: risk.mitigationPlan,
          status: risk.status
        });
      }
    }
  }, [mode, riskId, risks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      identifiedAt: dayjs(formData.identifiedAt).toISOString()
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">關聯任務</label>
        <select
          name="taskId"
          value={formData.taskId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">未指定</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">識別日期</label>
        <input
          type="date"
          name="identifiedAt"
          value={formData.identifiedAt}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">衝擊程度</label>
        <select
          name="impactLevel"
          value={formData.impactLevel}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={RiskLevel.LOW}>低</option>
          <option value={RiskLevel.MEDIUM}>中</option>
          <option value={RiskLevel.HIGH}>高</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">可能性</label>
        <select
          name="probability"
          value={formData.probability}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={RiskLevel.LOW}>低</option>
          <option value={RiskLevel.MEDIUM}>中</option>
          <option value={RiskLevel.HIGH}>高</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">因應計畫</label>
        <textarea
          name="mitigationPlan"
          value={formData.mitigationPlan}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={RiskStatus.OPEN}>開啟</option>
          <option value={RiskStatus.MITIGATED}>已緩解</option>
          <option value={RiskStatus.CLOSED}>已關閉</option>
        </select>
      </div>

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

export default RiskForm;
