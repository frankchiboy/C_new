import React, { createContext, useContext, useState } from 'react';
import { ViewMode } from '../types';

// UI上下文類型
interface UIContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  timeScale: 'day' | 'week' | 'month' | 'quarter';
  setTimeScale: (scale: 'day' | 'week' | 'month' | 'quarter') => void;
  showDependencies: boolean;
  toggleDependencies: () => void;
  showCriticalPath: boolean;
  toggleCriticalPath: () => void;
  activeDialog: string | null;
  openDialog: (dialogId: string) => void;
  closeDialog: () => void;
}

// 創建UI上下文
const UIContext = createContext<UIContextType | undefined>(undefined);

// UI Provider元件
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.GANTT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [timeScale, setTimeScale] = useState<'day' | 'week' | 'month' | 'quarter'>('week');
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleDependencies = () => {
    setShowDependencies(!showDependencies);
  };

  const toggleCriticalPath = () => {
    setShowCriticalPath(!showCriticalPath);
  };

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  // UI上下文值
  const contextValue: UIContextType = {
    activeView,
    setActiveView,
    sidebarCollapsed,
    toggleSidebar,
    timeScale,
    setTimeScale,
    showDependencies,
    toggleDependencies,
    showCriticalPath,
    toggleCriticalPath,
    activeDialog,
    openDialog,
    closeDialog
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

// 使用UI上下文的Hook
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};