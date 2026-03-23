import { useEffect, useState } from "react";
import { Folder, X, ChevronRight, Home } from "lucide-react";
import api from "../api/axios";
import type { FolderItem } from "../types";

interface MoveModalProps {
  fileId: string;
  fileName: string;
  currentFolderId: string | null;
  onClose: () => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
}

export default function MoveModal({ fileId, fileName, currentFolderId, onClose, onMove }: MoveModalProps) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [browsing, setBrowsing] = useState<string | null>(null);
  const [stack, setStack] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFolders = async (parentId: string | null) => {
    setLoading(true);
    try {
      const { data } = await api.get("/folders", { params: { parentId } });
      setFolders(data.folders);
    } catch {
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders(null);
  }, []);

  const handleFolderClick = (folder: FolderItem) => {
    setStack(prev => [...prev, { id: folder._id, name: folder.name }]);
    setBrowsing(folder._id);
    fetchFolders(folder._id);
  };

  const handleBreadcrumb = (index: number) => {
    if (index === -1) {
      setStack([]);
      setBrowsing(null);
      fetchFolders(null);
    } else {
      const newStack = stack.slice(0, index + 1);
      setStack(newStack);
      const folderId = newStack[newStack.length - 1].id;
      setBrowsing(folderId);
      fetchFolders(folderId);
    }
  };

  const handleMove = () => {
    onMove(fileId, browsing);
    onClose();
  };

  const isCurrentLocation = browsing === currentFolderId;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800">Move file</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{fileName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-6 py-3 text-sm text-gray-500 border-b border-gray-50">
          <button
            onClick={() => handleBreadcrumb(-1)}
            className="flex items-center gap-1 hover:text-primary"
          >
            <Home size={14} /> My Drive
          </button>
          {stack.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight size={12} />
              <button onClick={() => handleBreadcrumb(i)} className="hover:text-primary truncate max-w-24">
                {f.name}
              </button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="px-4 py-3 min-h-48 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Loading...
            </div>
          ) : folders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No folders here
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder._id}
                  onClick={() => handleFolderClick(folder)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition"
                >
                  <Folder size={20} className="text-primary fill-blue-100 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{folder.name}</span>
                  <ChevronRight size={14} className="text-gray-300 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current location indicator */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Moving to: <span className="font-medium text-gray-600">
              {stack.length === 0 ? "My Drive (root)" : stack[stack.length - 1].name}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isCurrentLocation}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-40"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
