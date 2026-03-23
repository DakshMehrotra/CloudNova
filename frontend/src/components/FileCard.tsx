import { useState } from "react";
import type { FileItem } from "../types";
import { Download, Star, Trash2, Share2, Eye, MoreVertical, RotateCcw, X, Pencil, FolderInput } from "lucide-react";

interface FileCardProps {
  file: FileItem;
  onDownload: (file: FileItem) => void;
  onStar: (fileId: string) => void;
  onTrash: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onShare: (fileId: string) => void;
  onPreview: (file: FileItem) => void;
  onRename: (fileId: string, newName: string) => void;
  onMove: (fileId: string) => void;
  showTrashActions?: boolean;
}

const getFileIcon = (mimeType: string): { color: string; label: string } => {
  if (mimeType.startsWith("image/")) return { color: "bg-green-100 text-green-700", label: "IMG" };
  if (mimeType === "application/pdf") return { color: "bg-red-100 text-red-700", label: "PDF" };
  if (mimeType.startsWith("video/")) return { color: "bg-purple-100 text-purple-700", label: "VID" };
  if (mimeType.startsWith("audio/")) return { color: "bg-yellow-100 text-yellow-700", label: "AUD" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return { color: "bg-green-100 text-green-700", label: "XLS" };
  if (mimeType.includes("document") || mimeType.includes("word")) return { color: "bg-blue-100 text-blue-700", label: "DOC" };
  return { color: "bg-gray-100 text-gray-600", label: "FILE" };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileCard({
  file, onDownload, onStar, onTrash, onDelete, onRestore,
  onShare, onPreview, onRename, onMove, showTrashActions
}: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const { color, label } = getFileIcon(file.mimeType);

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(file._id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") { setNewName(file.name); setIsRenaming(false); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition relative group">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xs font-bold mb-3`}>
        {label}
      </div>

      {/* Inline rename input OR file name */}
      {isRenaming ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          className="w-full text-sm border border-primary rounded px-2 py-1 outline-none mb-1"
        />
      ) : (
        <p className="text-sm font-medium text-gray-800 truncate mb-1" title={file.name}>
          {file.name}
        </p>
      )}

      <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
      {file.isStarred && <Star size={12} className="absolute top-3 right-10 text-yellow-400 fill-yellow-400" />}

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {menuOpen && (
        <div className="absolute right-2 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-44">
          <button onClick={() => { onPreview(file); setMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
            <Eye size={14} /> Preview
          </button>
          <button onClick={() => { onDownload(file); setMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
            <Download size={14} /> Download
          </button>
          {!showTrashActions && (
            <>
              <button onClick={() => { setIsRenaming(true); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Pencil size={14} /> Rename
              </button>
              <button onClick={() => { onMove(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <FolderInput size={14} /> Move to
              </button>
              <button onClick={() => { onStar(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Star size={14} /> {file.isStarred ? "Unstar" : "Star"}
              </button>
              <button onClick={() => { onShare(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Share2 size={14} /> Share link
              </button>
              <button onClick={() => { onTrash(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
                <Trash2 size={14} /> Move to Trash
              </button>
            </>
          )}
          {showTrashActions && (
            <>
              <button onClick={() => { onRestore?.(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <RotateCcw size={14} /> Restore
              </button>
              <button onClick={() => { onDelete?.(file._id); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
                <X size={14} /> Delete Forever
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
