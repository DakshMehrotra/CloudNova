import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";
import type { FileItem } from "../types";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Trash() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchTrashed = async () => {
    const { data } = await api.get("/files/trashed");
    setFiles(data.files);
  };

  useEffect(() => { fetchTrashed(); }, []);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar onUploadClick={() => {}} />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar onSearch={() => {}} />
        <main className="flex-1 p-6 pt-20 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Trash</h2>
          {files.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Trash is empty</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {files.map(file => (
                <FileCard key={file._id} file={file}
                  showTrashActions
                  onDownload={async (f) => {
                    const res = await api.get(`/files/${f._id}/download`, { responseType: "blob" });
                    const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
                    const a = document.createElement("a");
                    a.href = url;
                    a.setAttribute("download", f.originalName);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  onStar={() => {}}
                  onTrash={() => {}}
                  onShare={() => {}}
                  onPreview={(f) => window.open(`http://localhost:5001/api/files/${f._id}/preview`, "_blank")}
                  onRestore={async (id) => {
                    await api.patch(`/files/${id}/restore`);
                    toast.success("File restored");
                    fetchTrashed();
                  }}
                  onDelete={async (id) => {
                    if (confirm("Permanently delete? This cannot be undone.")) {
                      await api.delete(`/files/${id}`);
                      toast.success("File permanently deleted");
                      fetchTrashed();
                    }
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
