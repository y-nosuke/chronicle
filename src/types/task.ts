export type TaskStatus = 'todo' | 'inprogress' | 'hold' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface TaskRelation {
    targetId: string;
    type: 'parent' | 'child' | 'related';
}

export type HistoryType = 'CREATED' | 'UPDATED' | 'SPLIT_FROM' | 'MERGED_INTO' | 'STATUS_CHANGE';

export interface HistoryEvent {
    id: string;
    taskId: string; // Foreign key to Task
    timestamp: string; // ISO Date
    type: HistoryType;
    details: Record<string, unknown>; // JSON object for flexibility
}

export interface TimeLog {
    start: string; // ISO Date
    end?: string; // ISO Date
    type: 'work' | 'hold';
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    dueDate?: string; // ISO Date
    checklist: ChecklistItem[];
    relations: TaskRelation[];
    createdAt: string;
    updatedAt: string;
    timeLogs: TimeLog[];
    isDeleted?: boolean;
}
