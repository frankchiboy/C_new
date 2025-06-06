import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { ResourceType, Resource } from '../../types';

interface ResourceFormProps {
  mode: 'create' | 'edit';
  resourceId: string | null;
  onSubmit: (data: Partial<Resource>) => void;
  onCancel: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ mode, resourceId, onSubmit, onCancel }) => {
  const { resources } = useProject();
  const initialState = {
    name: '',
    type: ResourceType.HUMAN as ResourceType,
    ratePerHour: 0,
    contact: '',
    availableHours: {
      mon: 8,
      tue: 8,
      wed: 8,
      thu: 8,
      fri: 8,
      sat: 0,
      sun: 0
    }
  };
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (mode === 'edit' && resourceId) {
      const res = resources.find(r => r.id === resourceId);
      if (res) {
        setFormData({
          name: res.name,
          type: res.type,
          ratePerHour: res.ratePerHour,
          contact: res.contact,
          availableHours: res.availableHours
        });
      }
    }
  }, [mode, resourceId, resources]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = parseInt(value);
    if (!isNaN(num)) {
      setFormData(prev => ({
        ...prev,
        availableHours: {
          ...prev.availableHours,
          [name]: num
        }
      }));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          名稱
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          類型
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ResourceType.HUMAN}>人力</option>
          <option value={ResourceType.EQUIPMENT}>設備</option>
        </select>
      </div>

      <div>
        <label htmlFor="ratePerHour" className="block text-sm font-medium text-gray-700 mb-1">
          每小時費率
        </label>
        <input
          id="ratePerHour"
          name="ratePerHour"
          type="number"
          min="0"
          value={formData.ratePerHour}
          onChange={handleNumberChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
          聯絡方式
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          value={formData.contact}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">每週可用時數</label>
        <div className="grid grid-cols-4 gap-2">
          {(['mon','tue','wed','thu','fri','sat','sun'] as const).map(day => (
            <div key={day} className="flex flex-col items-start">
              <span className="text-xs capitalize mb-1">{day}</span>
              <input
                name={day}
                type="number"
                min="0"
                max="24"
                value={formData.availableHours[day]}
                onChange={handleHoursChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          ))}
        </div>
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

export default ResourceForm;
