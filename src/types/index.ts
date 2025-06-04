// 專案資料類型
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  currentState: ProjectState;
  hasUnsavedChanges: boolean;
  isUntitled: boolean;
}

// 任務資料類型
export interface Task {
  id: string;
  name: string;
  parentId: string | null;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  assigneeIds: string[];
  dependencies: TaskDependency[];
  type: TaskType;
  notes: string;
  order: number;
}

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  lag: number;
}

// 資源資料類型
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  availableHours: WeeklySchedule;
  calendar: string[]; // 例外日期
  ratePerHour: number;
  contact: string;
}

export interface WeeklySchedule {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

// 成本資料類型
export interface Cost {
  id: string;
  taskId: string;
  amount: number;
  category: CostCategory;
  currency: string;
  date: string;
  invoiceId: string;
  status: CostStatus;
  note: string;
}

// 風險資料類型
export interface Risk {
  id: string;
  taskId: string;
  identifiedAt: string;
  title: string;
  description: string;
  impactLevel: RiskLevel;
  probability: RiskLevel;
  mitigationPlan: string;
  status: RiskStatus;
}

// 快照資料類型
export interface Snapshot {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  type: SnapshotType;
  filePath: string;
}

// 最近專案紀錄
export interface RecentProject {
  fileName: string;
  filePath: string;
  openedAt: string;
  projectUUID: string;
  isTemporary: boolean;
}

// 各種列舉類型
export enum ProjectState {
  UNINITIALIZED = 'UNINITIALIZED',
  UNTITLED = 'UNTITLED',
  EDITING = 'EDITING',
  DIRTY = 'DIRTY',
  SAVED = 'SAVED',
  CLOSING = 'CLOSING'
}

export enum TaskType {
  STANDARD = 'standard',
  MILESTONE = 'milestone',
  BUFFER = 'buffer'
}

export enum DependencyType {
  FINISH_TO_START = 'FS',
  START_TO_START = 'SS',
  FINISH_TO_FINISH = 'FF',
  START_TO_FINISH = 'SF'
}

export enum ResourceType {
  HUMAN = 'human',
  EQUIPMENT = 'equipment'
}

export enum CostCategory {
  PERSONNEL = '人事',
  EQUIPMENT = '設備',
  OTHER = '其他'
}

export enum CostStatus {
  PENDING = 'pending',
  PAID = 'paid'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RiskStatus {
  OPEN = 'open',
  MITIGATED = 'mitigated',
  CLOSED = 'closed'
}

export enum SnapshotType {
  AUTO = 'Auto',
  MANUAL = 'Manual',
  CRASH_RECOVERY = 'Crash Recovery'
}

// UI 相關類型
export enum ViewMode {
  GANTT = 'gantt',
  TASKS = 'tasks',
  RESOURCES = 'resources',
  COSTS = 'costs',
  RISKS = 'risks',
  DASHBOARD = 'dashboard'
}

export interface UndoItem {
  type: UndoActionType;
  targetId: string;
  beforeState: object;
  afterState: object;
}

export enum UndoActionType {
  EDIT_TASK = 'edit-task',
  CREATE_TASK = 'create-task',
  DELETE_TASK = 'delete-task',
  MOVE_TASK = 'move-task',
  ASSIGN_RESOURCE = 'assign-resource',
  EDIT_RESOURCE = 'edit-resource',
  CREATE_RESOURCE = 'create-resource',
  DELETE_RESOURCE = 'delete-resource',
  EDIT_COST = 'edit-cost',
  CREATE_COST = 'create-cost',
  DELETE_COST = 'delete-cost',
  EDIT_RISK = 'edit-risk',
  CREATE_RISK = 'create-risk',
  DELETE_RISK = 'delete-risk'
}