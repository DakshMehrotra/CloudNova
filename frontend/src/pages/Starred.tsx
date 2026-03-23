import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";
import type { FileItem } from "../types";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Starred() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchStarred = async () => {
    const { data } = await api.get("/files/starred");
    setFiles(data.files);
  };

  useEffect(() => { fetchStarred(); }, []);

  const handleDownload = async (file: FileItem) => {
    const response = await api.get(`/files/${file._id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar onUploadClick={() => {}} />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar onSearch={() => {}} />
        <main className="flex-1 p-6 pt-20 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Starred</h2>
          {files.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No starred files yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {files.map(file => (
                <FileCard key={file._id} file={file}
                  onDownload={handleDownload}
                  onStar={async (id) => { await api.patch(`/files/${id}/star`); fetchStarred(); }}
                  onTrash={async (id) => { await api.patch(`/files/${id}/trash`); fetchStarred(); }}
                  onShare={async (id) => {
                    const { data } = await api.post(`/files/${id}/share`);
                    await navigator.clipboard.writeText(data.shareLink);
                    toast.success("Share link copied!");
                  }}
                  onPreview={(f) => window.open(`http://localhost:5001/api/files/${f._id}/preview`, "_blank")}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
