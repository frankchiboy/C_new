import React, { useEffect, useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useUI } from '../../contexts/UIContext';
import { Snapshot } from '../../types';

const SnapshotsDialog: React.FC = () => {
  const { project, loadProject } = useProject();
  const { getSnapshots, restoreSnapshot, deleteSnapshot } = useFileSystem();
  const { closeDialog } = useUI();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const list = await getSnapshots(project.id);
      setSnapshots(list);
      setLoading(false);
    };
    fetch();
  }, [getSnapshots, project.id]);

  const handleRestore = async (id: string) => {
    const data = await restoreSnapshot(id);
    if (data) {
      await loadProject(data.project.id);
      closeDialog();
    } else {
      alert('無法還原快照');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此快照嗎？')) {
      await deleteSnapshot(id);
      setSnapshots(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl animate-slideInBottom">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快照清單</h3>
        {loading ? (
          <div className="p-4 text-center text-gray-500">載入中...</div>
        ) : snapshots.length > 0 ? (
          <table className="min-w-full text-sm border border-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border-b text-left">名稱</th>
                <th className="px-3 py-2 border-b text-left">建立時間</th>
                <th className="px-3 py-2 border-b text-left">類型</th>
                <th className="px-3 py-2 border-b">操作</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.type}</td>
                  <td className="px-3 py-2 space-x-1">
                    <button onClick={() => handleRestore(s.id)} className="px-2 py-1 text-blue-600 hover:underline">還原</button>
                    <button onClick={() => handleDelete(s.id)} className="px-2 py-1 text-red-600 hover:underline">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-500">尚無快照</div>
        )}
        <div className="flex justify-end">
          <button onClick={closeDialog} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">關閉</button>
        </div>
      </div>
    </div>
  );
};

export default SnapshotsDialog;
