import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import UploadModal from "../components/UploadModal";
import PreviewModal from "../components/PreviewModal";
import MoveModal from "../components/MoveModal";
import type { FileItem, FolderItem } from "../types";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FolderPlus, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [moveFileName, setMoveFileName] = useState("");

  const fetchData = useCallback(async (folderId: string | null = null) => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        api.get("/files", { params: { folderId } }),
        api.get("/folders", { params: { parentId: folderId } }),
      ]);
      setFiles(filesRes.data.files);
      setFolders(foldersRes.data.folders);
    } catch {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentFolder);
  }, [currentFolder, fetchData]);

  const handleFolderClick = (folder: FolderItem) => {
    setFolderStack(prev => [...prev, { id: folder._id, name: folder.name }]);
    setCurrentFolder(folder._id);
    setSearchResults(null);
  };

  const handleBreadcrumb = (index: number) => {
    if (index === -1) {
      setFolderStack([]);
      setCurrentFolder(null);
    } else {
      const newStack = folderStack.slice(0, index + 1);
      setFolderStack(newStack);
      setCurrentFolder(newStack[newStack.length - 1].id);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await api.get(`/files/${file._id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Download failed");
    }
  };

  const handleStar = async (fileId: string) => {
    await api.patch(`/files/${fileId}/star`);
    fetchData(currentFolder);
  };

  const handleTrash = async (fileId: string) => {
    await api.patch(`/files/${fileId}/trash`);
    toast.success("Moved to trash");
    fetchData(currentFolder);
  };

  const handleShare = async (fileId: string) => {
    try {
      const { data } = await api.post(`/files/${fileId}/share`);
      await navigator.clipboard.writeText(data.shareLink);
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed to generate share link");
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      await api.patch(`/files/${fileId}/rename`, { name: newName });
      toast.success("File renamed");
      fetchData(currentFolder);
    } catch {
      toast.error("Rename failed");
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await api.patch(`/folders/${folderId}/rename`, { name: newName });
      toast.success("Folder renamed");
      fetchData(currentFolder);
    } catch {
      toast.error("Rename failed");
    }
  };

  const handleMoveClick = (fileId: string) => {
    const file = files.find(f => f._id === fileId);
    if (file) {
      setMoveFileId(fileId);
      setMoveFileName(file.name);
    }
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string | null) => {
    try {
      await api.patch(`/files/${fileId}/move`, { targetFolderId });
      toast.success("File moved successfully");
      fetchData(currentFolder);
    } catch {
      toast.error("Move failed");
    }
  };

  const handleStarFolder = async (folderId: string) => {
    await api.patch(`/folders/${folderId}/star`);
    fetchData(currentFolder);
  };

  const handleTrashFolder = async (folderId: string) => {
    await api.patch(`/folders/${folderId}/trash`);
    toast.success("Folder moved to trash");
    fetchData(currentFolder);
  };

  const handleCreateFolder = async () => {
    const name = prompt("New folder name:");
    if (!name?.trim()) return;
    try {
      await api.post("/folders", { name, parentId: currentFolder });
      toast.success("Folder created");
      fetchData(currentFolder);
    } catch {
      toast.error("Failed to create folder");
    }
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults(null); return; }
    try {
      const { data } = await api.get("/files/search", { params: { q } });
      setSearchResults(data.files);
    } catch {
      toast.error("Search failed");
    }
  };

  const displayFiles = searchResults ?? files;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar onUploadClick={() => setShowUpload(true)} />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar onSearch={handleSearch} />
        <main className="flex-1 p-6 pt-20 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-5">
            <button onClick={() => handleBreadcrumb(-1)} className="hover:text-primary font-medium">My Drive</button>
            {folderStack.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronRight size={14} />
                <button onClick={() => handleBreadcrumb(i)} className="hover:text-primary">{f.name}</button>
              </span>
            ))}
          </div>

          {!searchResults && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {folderStack.length > 0 ? folderStack[folderStack.length - 1].name : "My Drive"}
              </h2>
              <button onClick={handleCreateFolder}
                className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50">
                <FolderPlus size={16} /> New Folder
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <>
              {!searchResults && folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Folders</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {folders.map(folder => (
                      <FolderCard key={folder._id} folder={folder}
                        onClick={handleFolderClick}
                        onStar={handleStarFolder}
                        onTrash={handleTrashFolder}
                        onRename={handleRenameFolder}
                      />
                    ))}
                  </div>
                </div>
              )}

              {displayFiles.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {searchResults ? `Search results (${searchResults.length})` : "Files"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {displayFiles.map(file => (
                      <FileCard key={file._id} file={file}
                        onDownload={handleDownload}
                        onStar={handleStar}
                        onTrash={handleTrash}
                        onShare={handleShare}
                        onPreview={(f) => setPreviewFile(f)}
                        onRename={handleRenameFile}
                        onMove={handleMoveClick}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <p className="text-lg">No files here</p>
                  <p className="text-sm mt-1">Upload files or create a folder to get started</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal folderId={currentFolder} onClose={() => setShowUpload(false)}
          onUploadSuccess={() => fetchData(currentFolder)} />
      )}

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      )}

      {moveFileId && (
        <MoveModal
          fileId={moveFileId}
          fileName={moveFileName}
          currentFolderId={currentFolder}
          onClose={() => setMoveFileId(null)}
          onMove={handleMoveFile}
        />
      )}
    </div>
  );
}
