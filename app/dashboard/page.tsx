"use client";

import Navbar from "@/components/navbar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";
import { useUser } from "@clerk/nextjs";
import { Home, Layout, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
    const { user } = useUser();
    const { createBoard, boards, loading, error, deleteBoard } = useBoards();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const workspaceName = user?.firstName ? `${user.firstName}'s Workspace` : "My Workspace";
    const workspaceInitial = (user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "W")[0].toUpperCase();

    const filteredBoards = boards.filter((b: Board) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateBoard = async () => {
        const title = newBoardName.trim() || "New Board";
        setShowCreateDialog(false);
        setNewBoardName("");
        await createBoard({ title });
    };

    const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this board? This will also delete all its columns and tasks.")) return;
        setDeletingId(boardId);
        await deleteBoard(boardId);
        setDeletingId(null);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">Error loading boards: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden sm:flex flex-col py-4">
                    <div className="px-3 mb-4">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors mt-1"
                        >
                            <Layout className="h-4 w-4" />
                            Boards
                        </button>
                    </div>

                    <hr className="border-gray-200 mx-3 mb-4" />

                    <div className="px-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                            Workspaces
                        </p>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {workspaceInitial}
                            </div>
                            <span className="truncate">{workspaceName}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    {/* Workspace Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-9 w-9 rounded bg-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {workspaceInitial}
                        </div>
                        <h1 className="text-lg font-semibold text-gray-800">{workspaceName}</h1>
                    </div>

                    {/* Search */}
                    <div className="relative mb-5 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search boards..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Your Workspace
                    </p>

                    {/* Board Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredBoards.map((board: Board) => (
                                <Link
                                    href={`/boards/${board.id}`}
                                    key={board.id}
                                    className={`relative h-24 rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all ${deletingId === board.id ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <div className={`absolute inset-0 ${board.color}`} />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="absolute bottom-2 left-3 text-white text-sm font-semibold drop-shadow">
                                        {board.title}
                                    </span>
                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => handleDeleteBoard(e, board.id)}
                                        className="absolute top-2 right-2 h-6 w-6 rounded bg-black/30 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete board"
                                    >
                                        <Trash2 className="h-3 w-3 text-white" />
                                    </button>
                                </Link>
                            ))}

                            {/* Create new board */}
                            <button
                                onClick={() => setShowCreateDialog(true)}
                                className="h-24 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600 text-sm font-medium cursor-pointer group"
                            >
                                <span className="group-hover:text-gray-800 transition-colors">
                                    <Plus className="h-4 w-4 inline-block mr-1" />
                                    Create new board
                                </span>
                            </button>
                        </div>
                    )}

                    {filteredBoards.length === 0 && !loading && search && (
                        <p className="text-gray-400 text-sm mt-4">No boards match "{search}"</p>
                    )}
                </main>
            </div>

            {/* Create Board Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="w-[95vw] max-w-sm mx-auto">
                    <DialogHeader>
                        <DialogTitle>Create Board</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <Input
                            placeholder="Board name (optional)"
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowCreateDialog(false)}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBoard}
                                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}