"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    rectIntersection,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// ─── Priority dot ──────────────────────────────────────────────────────────────
function priorityDot(p: "low" | "medium" | "high") {
    const map = { low: "bg-green-500", medium: "bg-yellow-400", high: "bg-red-500" };
    return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${map[p]}`} />;
}

// ─── SortableTask ──────────────────────────────────────────────────────────────
function SortableTask({ task, onDelete }: { task: Task; onDelete: () => void }) {
    const {
        attributes, listeners, setNodeRef, setActivatorNodeRef,
        transform, transition, isDragging,
    } = useSortable({ id: task.id, data: { type: 'task' } });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition ?? "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
            }}
            {...listeners}
            {...attributes}
            className={`group/task bg-white rounded-lg border px-3 py-2.5 cursor-grab active:cursor-grabbing select-none transition-shadow ${
                isDragging
                    ? "border-dashed border-blue-300 bg-blue-50/40 shadow-none opacity-50"
                    : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-800 leading-snug flex-1">{task.title}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="opacity-0 group-hover/task:opacity-100 transition-opacity text-gray-300 hover:text-red-500 mt-0.5"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
                {priorityDot(task.priority)}
                {task.due_date && (
                    <span className="text-xs text-gray-400">{task.due_date}</span>
                )}
                {task.assignee && (
                    <span className="text-xs text-gray-400 truncate">{task.assignee}</span>
                )}
            </div>
        </div>
    );
}

// ─── DroppableColumn ───────────────────────────────────────────────────────────
function DroppableColumn({
    column, children, onCreateTask, onEditColumn, onDeleteColumn,
}: {
    column: ColumnWithTasks;
    children: React.ReactNode;
    onCreateTask: (e: any, columnId: string) => Promise<void>;
    onEditColumn: (column: ColumnWithTasks) => void;
    onDeleteColumn: (id: string) => void;
}) {
    const {
        attributes, listeners, setNodeRef, setActivatorNodeRef,
        transform, transition, isDragging,
    } = useSortable({ id: column.id, data: { type: 'column' } });
    const [addOpen, setAddOpen] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition ?? "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
                opacity: isDragging ? 0.45 : 1,
            }}
            className="flex-shrink-0 w-72 flex flex-col rounded-xl bg-white/95 shadow-md max-h-full"
        >
            {/* Column Header — drag handle */}
            <div
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                className="flex items-center justify-between px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing"
            >
                <span className="text-sm font-semibold text-gray-700 select-none">{column.title}</span>
                <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onEditColumn(column)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Delete "${column.title}"? All tasks will be removed.`))
                                onDeleteColumn(column.id);
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-2">
                {children}
            </div>

            {/* Add a card */}
            <div className="px-3 pb-3 pt-1">
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger render={
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors" />
                    }>
                        <Plus className="h-4 w-4" />
                        Add a card
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                        <DialogHeader>
                            <DialogTitle>Add Card to {column.title}</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={async (e) => { await onCreateTask(e, column.id); setAddOpen(false); }}>
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input id="title" name="title" placeholder="Enter task title" autoFocus />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea id="description" name="description" placeholder="Enter description" rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Assignee</Label>
                                <Input id="assignee" name="assignee" placeholder="Who should do this?" />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select name="priority" defaultValue="medium">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["low", "medium", "high"].map((p) => (
                                            <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" id="dueDate" name="dueDate" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit">Add Card</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// ─── Loading Skeletons ─────────────────────────────────────────────────────────
function ColumnSkeleton() {
    return (
        <div className="flex-shrink-0 w-72 rounded-xl bg-white/90 shadow-md p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg mb-2" />
            ))}
        </div>
    );
}

// ─── BoardPage ─────────────────────────────────────────────────────────────────
export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const {
        board, createColumn, updateBoard, columns, loading,
        createRealTask, setColumns, moveTask, updateColumn,
        deleteColumn, deleteTask, reorderColumns,
    } = useBoard(id);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newColor, setNewColor] = useState("");
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [isEditingColumn, setIsEditingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [editingColumnTitle, setEditingColumnTitle] = useState("");
    const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [draggingColumn, setDraggingColumn] = useState<ColumnWithTasks | null>(null);
    const [savingColumn, setSavingColumn] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
    );

    const allTasks = columns.flatMap((col) =>
        col.tasks.map((t) => ({ ...t, columnTitle: col.title }))
    );

    async function handleUpdateBoard(e: React.FormEvent) {
        e.preventDefault();
        if (!newTitle.trim() || !board) return;
        await updateBoard(board.id, { title: newTitle.trim(), color: newColor || board.color });
        setIsEditingTitle(false);
    }

    async function handleCreateTask(e: any, columnId?: string) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const taskData = {
            title: formData.get("title") as string,
            description: (formData.get("description") as string) || undefined,
            assignee: (formData.get("assignee") as string) || undefined,
            dueDate: (formData.get("dueDate") as string) || undefined,
            priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
        };
        const targetColumnId = columnId ?? columns[0]?.id;
        if (!targetColumnId || !taskData.title.trim()) return;
        await createRealTask(targetColumnId, taskData);
    }

    function handleDragStart(event: DragStartEvent) {
        const id = event.active.id as string;
        const col = columns.find((c) => c.id === id);
        if (col) { setDraggingColumn(col); setActiveTask(null); return; }
        const task = columns.flatMap((c) => c.tasks).find((t) => t.id === id);
        if (task) { setActiveTask(task); setDraggingColumn(null); }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over || draggingColumn) return; // ignore over events when dragging a column
        const activeId = active.id as string;
        const overId = over.id as string;
        const sourceCol = columns.find((c) => c.tasks.some((t) => t.id === activeId));
        const targetCol = columns.find((c) => c.tasks.some((t) => t.id === overId));
        if (!sourceCol || !targetCol || sourceCol.id !== targetCol.id) return;
        const ai = sourceCol.tasks.findIndex((t) => t.id === activeId);
        const oi = targetCol.tasks.findIndex((t) => t.id === overId);
        if (ai !== oi) {
            setColumns((prev: ColumnWithTasks[]) => {
                const next = [...prev];
                const col = next.find((c) => c.id === sourceCol.id)!;
                const tasks = [...col.tasks];
                const [rm] = tasks.splice(ai, 1);
                tasks.splice(oi, 0, rm);
                col.tasks = tasks;
                return next;
            });
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);

        // ── Column reorder
        if (draggingColumn) {
            setDraggingColumn(null);
            if (!over || active.id === over.id) return;
            const oldIndex = columns.findIndex((c) => c.id === active.id);
            const newIndex = columns.findIndex((c) => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                await reorderColumns(arrayMove(columns, oldIndex, newIndex));
            }
            return;
        }

        // ── Task move
        if (!over) return;
        const taskId = active.id as string;
        const overId = over.id as string;
        const colById = columns.find((c) => c.id === overId);
        if (colById) {
            const src = columns.find((c) => c.tasks.some((t) => t.id === taskId));
            if (src && src.id !== colById.id) await moveTask(taskId, colById.id, colById.tasks.length);
        } else {
            const src = columns.find((c) => c.tasks.some((t) => t.id === taskId));
            const tgt = columns.find((c) => c.tasks.some((t) => t.id === overId));
            if (src && tgt) {
                const oi = tgt.tasks.findIndex((t) => t.id === overId);
                await moveTask(taskId, tgt.id, oi);
            }
        }
    }

    async function handleCreateColumn(e: React.FormEvent) {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;
        setSavingColumn(true);
        await createColumn(newColumnTitle.trim());
        setNewColumnTitle("");
        setIsCreatingColumn(false);
        setSavingColumn(false);
    }

    async function handleUpdateColumn(e: React.FormEvent) {
        e.preventDefault();
        if (!editingColumnTitle.trim() || !editingColumn) return;
        await updateColumn(editingColumn.id, editingColumnTitle.trim());
        setIsEditingColumn(false);
        setEditingColumn(null);
        setEditingColumnTitle("");
    }

    function handleEditColumn(column: ColumnWithTasks) {
        setIsEditingColumn(true);
        setEditingColumn(column);
        setEditingColumnTitle(column.title);
    }

    const bgColor = board?.color ?? "bg-blue-500";

    return (
        <>
            <div className="h-screen flex flex-col overflow-hidden">
                <Navbar
                    boardTitle={board?.title}
                    onEditBoard={() => {
                        setNewTitle(board?.title ?? "");
                        setNewColor(board?.color ?? "");
                        setIsEditingTitle(true);
                    }}
                />

                <div className="flex flex-1 overflow-hidden">
                    {/* ── Left Sidebar: Todo List ─────────────────────────── */}
                    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Todo List</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{allTasks.length} task{allTasks.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-4">
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-7 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : columns.map((col) => (
                                col.tasks.length > 0 && (
                                    <div key={col.id}>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{col.title}</p>
                                        <div className="space-y-1">
                                            {col.tasks.map((task) => (
                                                <div key={task.id} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-50 group/todo">
                                                    {priorityDot(task.priority)}
                                                    <span className="text-xs text-gray-600 flex-1 truncate">{task.title}</span>
                                                    <button
                                                        onClick={() => deleteTask(task.id, col.id)}
                                                        className="opacity-0 group-hover/todo:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                            {!loading && allTasks.length === 0 && (
                                <p className="text-xs text-gray-400 text-center mt-4">No tasks yet</p>
                            )}
                        </div>
                    </aside>

                    {/* ── Board Area ──────────────────────────────────────── */}
                    <main className={`flex-1 ${bgColor} flex flex-col overflow-hidden`}>
                        {/* Board top bar */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-black/20">
                            <button
                                onClick={() => { setNewTitle(board?.title ?? ""); setNewColor(board?.color ?? ""); setIsEditingTitle(true); }}
                                className="text-white font-semibold text-base hover:bg-white/20 px-2 py-1 rounded transition-colors"
                            >
                                {board?.title ?? "…"}
                            </button>
                        </div>

                        {/* Columns */}
                        {loading ? (
                            <div className="flex gap-4 p-4 overflow-x-auto">
                                {[1, 2, 3].map((i) => <ColumnSkeleton key={i} />)}
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={rectIntersection}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="flex gap-4 p-4 overflow-x-auto flex-1 items-start [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                                    {columns.map((column) => (
                                        <DroppableColumn
                                            key={column.id}
                                            column={column}
                                            onCreateTask={handleCreateTask}
                                            onEditColumn={handleEditColumn}
                                            onDeleteColumn={deleteColumn}
                                        >
                                            <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                                {column.tasks.map((task) => (
                                                    <SortableTask
                                                        key={task.id}
                                                        task={task}
                                                        onDelete={() => deleteTask(task.id, column.id)}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DroppableColumn>
                                    ))}
                                    </SortableContext>
                                    {/* Add another list */}
                                    <button
                                        onClick={() => setIsCreatingColumn(true)}
                                        className="flex-shrink-0 w-72 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add another list
                                    </button>

                                    <DragOverlay
                                        dropAnimation={{
                                            duration: 220,
                                            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                                        }}
                                    >
                                        {activeTask ? (
                                            <div
                                                className="bg-white rounded-lg border border-blue-300 px-3 py-2.5 shadow-2xl cursor-grabbing"
                                                style={{
                                                    width: 272,
                                                    transform: "rotate(2deg) scale(1.03)",
                                                    boxShadow: "0 20px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(59,130,246,0.15)",
                                                }}
                                            >
                                                <p className="text-sm text-gray-800 font-medium">{activeTask.title}</p>
                                                {(activeTask.priority || activeTask.due_date) && (
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {priorityDot(activeTask.priority)}
                                                        {activeTask.due_date && <span className="text-xs text-gray-400">{activeTask.due_date}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </div>
                            </DndContext>
                        )}
                    </main>
                </div>
            </div>

            {/* ── Dialogs ─────────────────────────────────────────────────── */}

            {/* Edit Board */}
            <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                    <DialogHeader><DialogTitle>Edit Board</DialogTitle></DialogHeader>
                    <form className="space-y-4" onSubmit={handleUpdateBoard}>
                        <div className="space-y-2">
                            <Label htmlFor="boardTitle">Board Title</Label>
                            <Input id="boardTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Board Color</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {["bg-blue-500","bg-green-500","bg-yellow-500","bg-red-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-gray-500","bg-orange-500","bg-teal-500","bg-cyan-500","bg-emerald-500"].map((color) => (
                                    <button key={color} type="button" className={`w-8 h-8 rounded-full ${color} ${color === newColor ? "ring-2 ring-offset-2 ring-gray-800" : ""}`} onClick={() => setNewColor(color)} />
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Column */}
            <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
                <DialogContent className="w-[95vw] max-w-sm mx-auto">
                    <DialogHeader><DialogTitle>Add List</DialogTitle></DialogHeader>
                    <form className="space-y-4" onSubmit={handleCreateColumn}>
                        <Input value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} placeholder="List name..." autoFocus required />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreatingColumn(false)}>Cancel</Button>
                            <Button type="submit" disabled={savingColumn}>
                                {savingColumn && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                Add List
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Column */}
            <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
                <DialogContent className="w-[95vw] max-w-sm mx-auto">
                    <DialogHeader><DialogTitle>Rename List</DialogTitle></DialogHeader>
                    <form className="space-y-4" onSubmit={handleUpdateColumn}>
                        <Input value={editingColumnTitle} onChange={(e) => setEditingColumnTitle(e.target.value)} autoFocus required />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => { setIsEditingColumn(false); setEditingColumn(null); }}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}