export interface Board {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    color: string;
    user_id: string;
}
export interface Column {
    id: string;
    title: string;
    board_id: string;
    created_at: string;
    sort_order: number;
}
export interface Task {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    column_id: string;
    sort_order: number;
    updated_at: string;
    priority: "low" | "medium" | "high";
    assignee: string | null;
    due_date: string | null;
}