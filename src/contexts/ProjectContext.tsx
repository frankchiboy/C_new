import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { 
  Project, Task, Resource, Cost, Risk, 
  ProjectState, UndoItem, UndoActionType 
} from '../types';
import { useFileSystem } from './FileSystemContext';

// 初始專案狀態
const initialProject: Project = {
  id: '',
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  startDate: '',
  endDate: '',
  createdBy: '',
  currentState: ProjectState.UNINITIALIZED,
  hasUnsavedChanges: false,
  isUntitled: true
};

// 專案上下文類型
interface ProjectContextType {
  project: Project;
  tasks: Task[];
  resources: Resource[];
  costs: Cost[];
  risks: Risk[];
  undoStack: UndoItem[];
  redoStack: UndoItem[];
  createProject: (name?: string) => Project;
  saveProject: () => Promise<boolean>;
  saveProjectAs: (name: string) => Promise<boolean>;
  loadProject: (id: string) => Promise<boolean>;
  updateProject: (updates: Partial<Project>) => void;
  setDirty: () => void;
  createTask: (task: Partial<Task>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  createResource: (resource: Partial<Resource>) => string;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  createCost: (cost: Partial<Cost>) => string;
  updateCost: (id: string, updates: Partial<Cost>) => void;
  deleteCost: (id: string) => void;
  createRisk: (risk: Partial<Risk>) => string;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  manualSnapshot: () => Promise<boolean>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// 創建專案上下文
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 專案Provider元件
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { saveFile, loadFile, createSnapshot } = useFileSystem();
  const [project, setProject] = useState<Project>(initialProject);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);
  const [redoStack, setRedoStack] = useState<UndoItem[]>([]);

  // 自動快照計時器
  useEffect(() => {
    if (!project.id) return;
    const interval = setInterval(() => {
      const data = { project, tasks, resources, costs, risks };
      createSnapshot(data, project.id, 'Auto');
    }, 600000);
    return () => clearInterval(interval);
  }, [project.id, project, tasks, resources, costs, risks, createSnapshot]);
  
  // 計算是否可以撤消/重做
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // 將變更狀態設置為已修改
  const setDirty = () => {
    if (project.currentState !== ProjectState.DIRTY) {
      setProject(prev => ({
        ...prev,
        currentState: ProjectState.DIRTY,
        hasUnsavedChanges: true,
        updatedAt: dayjs().toISOString()
      }));
    }
  };

  // 創建新專案
  const createProject = (name?: string): Project => {
    const now = dayjs();
    const newProjectId = uuidv4();
    const newProject: Project = {
      id: newProjectId,
      name: name || `未命名專案`,
      description: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      startDate: now.toISOString(),
      endDate: now.add(1, 'month').toISOString(),
      createdBy: '使用者',
      currentState: ProjectState.UNTITLED,
      hasUnsavedChanges: false,
      isUntitled: !name
    };
    
    setProject(newProject);
    setTasks([]);
    setResources([]);
    setCosts([]);
    setRisks([]);
    setUndoStack([]);
    setRedoStack([]);
    
    return newProject;
  };

  // 儲存專案
  const saveProject = async (): Promise<boolean> => {
    try {
      const projectData = {
        project,
        tasks,
        resources,
        costs,
        risks
      };
      
      const saved = await saveFile(projectData, project.name);
      
      if (saved) {
        setProject(prev => ({
          ...prev,
          currentState: ProjectState.SAVED,
          hasUnsavedChanges: false,
          updatedAt: dayjs().toISOString()
        }));
        
        // 建立手動快照
        await createSnapshot(projectData, project.id, 'Manual');
        return true;
      }
      return false;
    } catch (error) {
      console.error('儲存專案失敗:', error);
      return false;
    }
  };

  // 另存新檔
  const saveProjectAs = async (name: string): Promise<boolean> => {
    try {
      setProject(prev => ({
        ...prev,
        name,
        isUntitled: false
      }));
      
      const result = await saveProject();
      return result;
    } catch (error) {
      console.error('另存專案失敗:', error);
      return false;
    }
  };

  // 載入專案
  const loadProject = async (id: string): Promise<boolean> => {
    try {
      const data = await loadFile(id);
      if (data) {
        setProject(data.project);
        setTasks(data.tasks || []);
        setResources(data.resources || []);
        setCosts(data.costs || []);
        setRisks(data.risks || []);
        setUndoStack([]);
        setRedoStack([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('載入專案失敗:', error);
      return false;
    }
  };

  // 更新專案資訊
  const updateProject = (updates: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...updates }));
    setDirty();
  };

  // 添加撤消操作
  const pushUndo = (item: UndoItem) => {
    setUndoStack(prev => [...prev.slice(-49), item]);
    setRedoStack([]);
  };

  // 任務相關操作
  const createTask = (taskData: Partial<Task>): string => {
    const id = uuidv4();
    const now = dayjs();
    const newTask: Task = {
      id,
      name: taskData.name || '新任務',
      parentId: taskData.parentId || null,
      startDate: taskData.startDate || now.toISOString(),
      endDate: taskData.endDate || now.add(1, 'day').toISOString(),
      duration: taskData.duration || 1,
      progress: taskData.progress || 0,
      assigneeIds: taskData.assigneeIds || [],
      dependencies: taskData.dependencies || [],
      type: taskData.type || 'standard',
      notes: taskData.notes || '',
      order: tasks.length
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // 記錄撤消操作
    pushUndo({
      type: UndoActionType.CREATE_TASK,
      targetId: id,
      beforeState: {},
      afterState: { task: newTask }
    });
    
    setDirty();
    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      
      const oldTask = prev[taskIndex];
      const newTask = { ...oldTask, ...updates };
      
      // 記錄撤消操作
      pushUndo({
        type: UndoActionType.EDIT_TASK,
        targetId: id,
        beforeState: { task: oldTask },
        afterState: { task: newTask }
      });
      
      const newTasks = [...prev];
      newTasks[taskIndex] = newTask;
      return newTasks;
    });
    
    setDirty();
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      
      const deletedTask = prev[taskIndex];
      
      // 記錄撤消操作
      pushUndo({
        type: UndoActionType.DELETE_TASK,
        targetId: id,
        beforeState: { task: deletedTask },
        afterState: {}
      });
      
      return prev.filter(t => t.id !== id);
    });
    
    setDirty();
  };

  // 資源相關操作
  const createResource = (resourceData: Partial<Resource>): string => {
    const id = uuidv4();
    const newResource: Resource = {
      id,
      name: resourceData.name || '新資源',
      type: resourceData.type || 'human',
      availableHours: resourceData.availableHours || {
        mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0
      },
      calendar: resourceData.calendar || [],
      ratePerHour: resourceData.ratePerHour || 0,
      contact: resourceData.contact || ''
    };

    setResources(prev => [...prev, newResource]);
    pushUndo({
      type: UndoActionType.CREATE_RESOURCE,
      targetId: id,
      beforeState: {},
      afterState: { resource: newResource }
    });
    setDirty();
    return id;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index === -1) return prev;
      
      const oldResource = prev[index];
      
      // 記錄撤消操作
      pushUndo({
        type: UndoActionType.EDIT_RESOURCE,
        targetId: id,
        beforeState: { resource: oldResource },
        afterState: { resource: { ...oldResource, ...updates } }
      });
      
      const newResources = [...prev];
      newResources[index] = { ...oldResource, ...updates };
      return newResources;
    });
    
    setDirty();
  };

  const deleteResource = (id: string) => {
    setResources(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index === -1) return prev;

      const deleted = prev[index];

      pushUndo({
        type: UndoActionType.DELETE_RESOURCE,
        targetId: id,
        beforeState: { resource: deleted },
        afterState: {}
      });

      return prev.filter(r => r.id !== id);
    });
    setDirty();
  };

  // 成本相關操作
  const createCost = (costData: Partial<Cost>): string => {
    const id = uuidv4();
    const newCost: Cost = {
      id,
      taskId: costData.taskId || '',
      amount: costData.amount || 0,
      category: costData.category || 'OTHER',
      currency: costData.currency || 'TWD',
      date: costData.date || dayjs().toISOString(),
      invoiceId: costData.invoiceId || '',
      status: costData.status || 'pending',
      note: costData.note || ''
    };
    
    setCosts(prev => [...prev, newCost]);
    pushUndo({
      type: UndoActionType.CREATE_COST,
      targetId: id,
      beforeState: {},
      afterState: { cost: newCost }
    });
    setDirty();
    return id;
  };

  const updateCost = (id: string, updates: Partial<Cost>) => {
    setCosts(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      
      const oldCost = prev[index];
      
      // 記錄撤消操作
      pushUndo({
        type: UndoActionType.EDIT_COST,
        targetId: id,
        beforeState: { cost: oldCost },
        afterState: { cost: { ...oldCost, ...updates } }
      });
      
      const newCosts = [...prev];
      newCosts[index] = { ...oldCost, ...updates };
      return newCosts;
    });
    
    setDirty();
  };

  const deleteCost = (id: string) => {
    setCosts(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;

      const deleted = prev[index];

      pushUndo({
        type: UndoActionType.DELETE_COST,
        targetId: id,
        beforeState: { cost: deleted },
        afterState: {}
      });

      return prev.filter(c => c.id !== id);
    });
    setDirty();
  };

  // 風險相關操作
  const createRisk = (riskData: Partial<Risk>): string => {
    const id = uuidv4();
    const newRisk: Risk = {
      id,
      taskId: riskData.taskId || '',
      identifiedAt: riskData.identifiedAt || dayjs().toISOString(),
      title: riskData.title || '新風險',
      description: riskData.description || '',
      impactLevel: riskData.impactLevel || 'medium',
      probability: riskData.probability || 'medium',
      mitigationPlan: riskData.mitigationPlan || '',
      status: riskData.status || 'open'
    };
    
    setRisks(prev => [...prev, newRisk]);
    pushUndo({
      type: UndoActionType.CREATE_RISK,
      targetId: id,
      beforeState: {},
      afterState: { risk: newRisk }
    });
    setDirty();
    return id;
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    setRisks(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index === -1) return prev;

      const oldRisk = prev[index];
      const updated = { ...oldRisk, ...updates };

      pushUndo({
        type: UndoActionType.EDIT_RISK,
        targetId: id,
        beforeState: { risk: oldRisk },
        afterState: { risk: updated }
      });

      const newRisks = [...prev];
      newRisks[index] = updated;
      return newRisks;
    });

    setDirty();
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index === -1) return prev;

      const deleted = prev[index];

      pushUndo({
        type: UndoActionType.DELETE_RISK,
        targetId: id,
        beforeState: { risk: deleted },
        afterState: {}
      });

      return prev.filter(r => r.id !== id);
    });
    setDirty();
  };

  // 手動建立快照
  const manualSnapshot = async (): Promise<boolean> => {
    try {
      const data = { project, tasks, resources, costs, risks };
      await createSnapshot(data, project.id, 'Manual');
      return true;
    } catch (error) {
      console.error('建立快照失敗:', error);
      return false;
    }
  };

  // 撤消操作
  const undo = () => {
    if (undoStack.length === 0) return;
    
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    switch (action.type) {
      case UndoActionType.CREATE_TASK:
        setTasks(prev => prev.filter(t => t.id !== action.targetId));
        break;
        
      case UndoActionType.EDIT_TASK:
        setTasks(prev => {
          const index = prev.findIndex(t => t.id === action.targetId);
          if (index === -1) return prev;
          
          const newTasks = [...prev];
          newTasks[index] = action.beforeState.task as Task;
          return newTasks;
        });
        break;
        
      case UndoActionType.DELETE_TASK:
        setTasks(prev => [...prev, action.beforeState.task as Task]);
        break;

      case UndoActionType.CREATE_RESOURCE:
        setResources(prev => prev.filter(r => r.id !== action.targetId));
        break;

      case UndoActionType.EDIT_RESOURCE:
        setResources(prev => {
          const idx = prev.findIndex(r => r.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.beforeState.resource as Resource;
          return arr;
        });
        break;

      case UndoActionType.DELETE_RESOURCE:
        setResources(prev => [...prev, action.beforeState.resource as Resource]);
        break;

      case UndoActionType.CREATE_COST:
        setCosts(prev => prev.filter(c => c.id !== action.targetId));
        break;

      case UndoActionType.EDIT_COST:
        setCosts(prev => {
          const idx = prev.findIndex(c => c.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.beforeState.cost as Cost;
          return arr;
        });
        break;

      case UndoActionType.DELETE_COST:
        setCosts(prev => [...prev, action.beforeState.cost as Cost]);
        break;

      case UndoActionType.CREATE_RISK:
        setRisks(prev => prev.filter(r => r.id !== action.targetId));
        break;

      case UndoActionType.EDIT_RISK:
        setRisks(prev => {
          const idx = prev.findIndex(r => r.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.beforeState.risk as Risk;
          return arr;
        });
        break;

      case UndoActionType.DELETE_RISK:
        setRisks(prev => [...prev, action.beforeState.risk as Risk]);
        break;

      // 其他類型的撤消操作...
    }
    
    // 添加至重做堆疊
    setRedoStack(prev => [...prev, action]);
    setDirty();
  };

  // 重做操作
  const redo = () => {
    if (redoStack.length === 0) return;
    
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    switch (action.type) {
      case UndoActionType.CREATE_TASK:
        setTasks(prev => [...prev, action.afterState.task as Task]);
        break;
        
      case UndoActionType.EDIT_TASK:
        setTasks(prev => {
          const index = prev.findIndex(t => t.id === action.targetId);
          if (index === -1) return prev;
          
          const newTasks = [...prev];
          newTasks[index] = action.afterState.task as Task;
          return newTasks;
        });
        break;
        
      case UndoActionType.DELETE_TASK:
        setTasks(prev => prev.filter(t => t.id !== action.targetId));
        break;

      case UndoActionType.CREATE_RESOURCE:
        setResources(prev => [...prev, action.afterState.resource as Resource]);
        break;

      case UndoActionType.EDIT_RESOURCE:
        setResources(prev => {
          const idx = prev.findIndex(r => r.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.afterState.resource as Resource;
          return arr;
        });
        break;

      case UndoActionType.DELETE_RESOURCE:
        setResources(prev => prev.filter(r => r.id !== action.targetId));
        break;

      case UndoActionType.CREATE_COST:
        setCosts(prev => [...prev, action.afterState.cost as Cost]);
        break;

      case UndoActionType.EDIT_COST:
        setCosts(prev => {
          const idx = prev.findIndex(c => c.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.afterState.cost as Cost;
          return arr;
        });
        break;

      case UndoActionType.DELETE_COST:
        setCosts(prev => prev.filter(c => c.id !== action.targetId));
        break;

      case UndoActionType.CREATE_RISK:
        setRisks(prev => [...prev, action.afterState.risk as Risk]);
        break;

      case UndoActionType.EDIT_RISK:
        setRisks(prev => {
          const idx = prev.findIndex(r => r.id === action.targetId);
          if (idx === -1) return prev;
          const arr = [...prev];
          arr[idx] = action.afterState.risk as Risk;
          return arr;
        });
        break;

      case UndoActionType.DELETE_RISK:
        setRisks(prev => prev.filter(r => r.id !== action.targetId));
        break;

      // 其他類型的重做操作...
    }
    
    // 添加回撤消堆疊
    setUndoStack(prev => [...prev, action]);
    setDirty();
  };

  // 專案上下文值
  const contextValue: ProjectContextType = {
    project,
    tasks,
    resources,
    costs,
    risks,
    undoStack,
    redoStack,
    createProject,
    saveProject,
    saveProjectAs,
    loadProject,
    updateProject,
    setDirty,
    createTask,
    updateTask,
    deleteTask,
    createResource,
    updateResource,
    deleteResource,
    createCost,
    updateCost,
    deleteCost,
    createRisk,
    updateRisk,
    deleteRisk,
    manualSnapshot,
    undo,
    redo,
    canUndo,
    canRedo
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

// 使用專案上下文的Hook
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};