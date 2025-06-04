import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {
  SnapshotType,
  Project,
  Task,
  Resource,
  Cost,
  Risk,
  Snapshot,
  RecentProject
} from '../types';

interface ProjectFileData {
  project: Project;
  tasks: Task[];
  resources: Resource[];
  costs: Cost[];
  risks: Risk[];
}

// 檔案系統上下文類型
interface FileSystemContextType {
  saveFile: (data: ProjectFileData, filename: string) => Promise<boolean>;
  loadFile: (id: string) => Promise<ProjectFileData | null>;
  createSnapshot: (data: ProjectFileData, projectId: string, type: SnapshotType) => Promise<boolean>;
  getSnapshots: (projectId: string) => Promise<Snapshot[]>;
  restoreSnapshot: (snapshotId: string) => Promise<ProjectFileData | null>;
  getRecentProjects: () => Promise<RecentProject[]>;
  addRecentProject: (project: RecentProject) => Promise<void>;
}

// 創建檔案系統上下文
const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

// 檔案系統Provider元件
export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  // 初始化從localStorage加載資料
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('recentProjects');
      if (storedProjects) {
        setRecentProjects(JSON.parse(storedProjects));
      }
      
      const storedSnapshots = localStorage.getItem('projectSnapshots');
      if (storedSnapshots) {
        setSnapshots(JSON.parse(storedSnapshots));
      }
    } catch (error) {
      console.error('載入儲存的專案資訊失敗:', error);
    }
  }, []);

  // 儲存檔案
  const saveFile = async (data: ProjectFileData, filename: string): Promise<boolean> => {
    try {
      // 建立 .mpproj 格式檔案
      const zip = new JSZip();
      
      // 建立manifest.json
      const manifest = {
        project_uuid: data.project.id,
        file_version: '1.0.0',
        created_platform: navigator.platform,
        created_with_version: '0.1.0'
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      
      // 建立project.json
      const projectData = {
        project_name: data.project.name,
        description: data.project.description,
        created_by: data.project.createdBy,
        start_date: data.project.startDate,
        end_date: data.project.endDate
      };
      zip.file('project.json', JSON.stringify(projectData, null, 2));
      
      // 建立tasks.json
      zip.file('tasks.json', JSON.stringify(data.tasks, null, 2));
      
      // 建立resources.json
      zip.file('resources.json', JSON.stringify(data.resources, null, 2));
      
      // 建立cost.json
      zip.file('cost.json', JSON.stringify(data.costs, null, 2));
      
      // 建立risklog.json
      zip.file('risklog.json', JSON.stringify(data.risks, null, 2));
      
      // 建立schedule.json
      const scheduleData = {
        baseline: [],
        actual: [],
        deviation: []
      };
      zip.file('schedule.json', JSON.stringify(scheduleData, null, 2));
      
      // 建立meta/log.txt
      const metaFolder = zip.folder('meta');
      metaFolder?.file('log.txt', `Project created: ${new Date().toISOString()}`);
      
      // 建立空白的attachments資料夾
      zip.folder('attachments');
      
      // 產生壓縮檔
      const content = await zip.generateAsync({ type: 'blob' });
      
      // 儲存檔案
      saveAs(content, `${filename}.mpproj`);
      
      // 更新最近專案清單
      addRecentProject({
        fileName: filename,
        filePath: `${filename}.mpproj`,
        openedAt: new Date().toISOString(),
        projectUUID: data.project.id,
        isTemporary: data.project.isUntitled
      });
      
      // 儲存資料到localStorage
      localStorage.setItem(`project_${data.project.id}`, JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('儲存檔案失敗:', error);
      return false;
    }
  };

  // 載入檔案
  const loadFile = async (id: string): Promise<ProjectFileData | null> => {
    try {
      // 從localStorage載入資料
      const storedData = localStorage.getItem(`project_${id}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return null;
    } catch (error) {
      console.error('載入檔案失敗:', error);
      return null;
    }
  };

  // 創建快照
  const createSnapshot = async (
    data: ProjectFileData,
    projectId: string, 
    type: SnapshotType
  ): Promise<boolean> => {
    try {
      const timestamp = new Date().toISOString();
      const snapshotId = `snapshot_${projectId}_${timestamp}`;
      const snapshotData = {
        id: snapshotId,
        projectId,
        name: `${data.project.name}_${timestamp}`,
        createdAt: timestamp,
        type,
        data
      };
      
      // 儲存快照到localStorage
      localStorage.setItem(snapshotId, JSON.stringify(snapshotData));
      
      // 更新快照清單
      const newSnapshots = [...snapshots, {
        id: snapshotId,
        projectId,
        name: `${data.project.name}_${timestamp}`,
        createdAt: timestamp,
        type
      }];
      
      setSnapshots(newSnapshots);
      localStorage.setItem('projectSnapshots', JSON.stringify(newSnapshots));
      
      return true;
    } catch (error) {
      console.error('創建快照失敗:', error);
      return false;
    }
  };

  // 獲取特定專案的快照
  const getSnapshots = async (projectId: string): Promise<Snapshot[]> => {
    return snapshots.filter(snapshot => snapshot.projectId === projectId);
  };

  // 還原快照
  const restoreSnapshot = async (snapshotId: string): Promise<ProjectFileData | null> => {
    try {
      const snapshotData = localStorage.getItem(snapshotId);
      if (snapshotData) {
        return JSON.parse(snapshotData).data;
      }
      return null;
    } catch (error) {
      console.error('還原快照失敗:', error);
      return null;
    }
  };

  // 獲取最近專案清單
  const getRecentProjects = async (): Promise<RecentProject[]> => {
    return recentProjects;
  };

  // 添加到最近專案清單
  const addRecentProject = async (project: RecentProject): Promise<void> => {
    // 最多保留10個最近專案
    const updatedProjects = [
      project,
      ...recentProjects.filter(p => p.projectUUID !== project.projectUUID)
    ].slice(0, 10);
    
    setRecentProjects(updatedProjects);
    localStorage.setItem('recentProjects', JSON.stringify(updatedProjects));
  };

  // 檔案系統上下文值
  const contextValue: FileSystemContextType = {
    saveFile,
    loadFile,
    createSnapshot,
    getSnapshots,
    restoreSnapshot,
    getRecentProjects,
    addRecentProject
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

// 使用檔案系統上下文的Hook
export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};