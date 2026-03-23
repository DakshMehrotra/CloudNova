import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

interface UploadModalProps {
  folderId: string | null;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ folderId, onClose, onUploadSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      if (folderId) formData.append("folderId", folderId);
      try {
        await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        setProgress(0);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(`Failed to upload ${files[i].name}: ${message}`);
      }
    }
    toast.success(`${files.length} file(s) uploaded!`);
    setUploading(false);
    onUploadSuccess();
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Upload Files</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            isDragActive ? "border-primary bg-blue-50" : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Drag & drop files here</p>
          <p className="text-gray-400 text-sm mt-1">or click to browse</p>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                <span className="text-xs text-gray-400 mx-2">{formatSize(file.size)}</span>
                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {uploading && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
          </div>
        )}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={uploading}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={uploading || files.length === 0}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
