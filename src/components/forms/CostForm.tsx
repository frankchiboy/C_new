import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useProject } from '../../contexts/ProjectContext';
import { CostCategory, CostStatus, Cost } from '../../types';

interface CostFormProps {
  mode: 'create' | 'edit';
  costId: string | null;
  onSubmit: (data: Partial<Cost>) => void;
  onCancel: () => void;
}

const CostForm: React.FC<CostFormProps> = ({ mode, costId, onSubmit, onCancel }) => {
  const { costs, tasks } = useProject();
  const initialState = {
    taskId: '',
    amount: 0,
    category: CostCategory.PERSONNEL as CostCategory,
    currency: 'TWD',
    date: dayjs().format('YYYY-MM-DD'),
    invoiceId: '',
    status: CostStatus.PENDING as CostStatus,
    note: ''
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (mode === 'edit' && costId) {
      const cost = costs.find(c => c.id === costId);
      if (cost) {
        setFormData({
          taskId: cost.taskId,
          amount: cost.amount,
          category: cost.category,
          currency: cost.currency,
          date: dayjs(cost.date).format('YYYY-MM-DD'),
          invoiceId: cost.invoiceId,
          status: cost.status,
          note: cost.note
        });
      }
    }
  }, [mode, costId, costs]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFormData(prev => ({ ...prev, [name]: num }));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: dayjs(formData.date).toISOString()
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">任務</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleNumberChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={CostCategory.PERSONNEL}>人事</option>
          <option value={CostCategory.EQUIPMENT}>設備</option>
          <option value={CostCategory.OTHER}>其他</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">貨幣</label>
        <input
          type="text"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">發票號碼</label>
        <input
          type="text"
          name="invoiceId"
          value={formData.invoiceId}
          onChange={handleChange}
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
          <option value={CostStatus.PENDING}>未付款</option>
          <option value={CostStatus.PAID}>已付款</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

export default CostForm;
