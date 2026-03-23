import { useState } from "react";
import type { FolderItem } from "../types";
import { Folder, Star, Trash2, MoreVertical, Pencil } from "lucide-react";

interface FolderCardProps {
  folder: FolderItem;
  onClick: (folder: FolderItem) => void;
  onStar: (folderId: string) => void;
  onTrash: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
}

export default function FolderCard({ folder, onClick, onStar, onTrash, onRename }: FolderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder._id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") { setNewName(folder.name); setIsRenaming(false); }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition relative group cursor-pointer"
      onDoubleClick={() => !isRenaming && onClick(folder)}
    >
      <div className="flex items-center gap-3 mb-2">
        <Folder size={32} className="text-primary fill-blue-100 shrink-0" />
        {isRenaming ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm border border-primary rounded px-2 py-1 outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800 truncate flex-1">{folder.name}</p>
        )}
        {folder.isStarred && !isRenaming && (
          <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {menuOpen && (
        <div className="absolute right-2 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-36">
          <button onClick={() => { setIsRenaming(true); setMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
            <Pencil size={14} /> Rename
          </button>
          <button onClick={() => { onStar(folder._id); setMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
            <Star size={14} /> {folder.isStarred ? "Unstar" : "Star"}
          </button>
          <button onClick={() => { onTrash(folder._id); setMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
            <Trash2 size={14} /> Trash
          </button>
        </div>
      )}
    </div>
  );
}
