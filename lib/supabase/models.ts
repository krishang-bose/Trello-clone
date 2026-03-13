export interface Board {
    id: string;
    title: string;
    description: string | null;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: string;
    board_id: string;
    title: string;
    sort_order: number;
    created_at: string;
}

export type ColumnWithTasks = Column & {
    tasks: Task[];
};

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    column_id: string;
    title: string;
    description: string | null;
    assignee: string | null;
    due_date: string | null;
    priority: "low" | "medium" | "high";
    sort_order: number;
    created_at: string;
    labels: string[];
    archived: boolean;
    checklist_items: ChecklistItem[];
}