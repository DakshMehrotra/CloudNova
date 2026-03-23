import { useState, useEffect } from "react";
import type { FileItem } from "../types";
import { X, Download, ExternalLink, FileText } from "lucide-react";

interface PreviewModalProps {
  file: FileItem;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

const BASE_URL = "http://localhost:5001/api";

const getPreviewType = (mimeType: string): "image" | "pdf" | "video" | "audio" | "text" | "other" => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
};

export default function PreviewModal({ file, onClose, onDownload }: PreviewModalProps) {
  const [textContent, setTextContent] = useState<string>("");
  const [loadingText, setLoadingText] = useState(false);
  const previewType = getPreviewType(file.mimeType);
  const token = localStorage.getItem("accessToken");
  const previewUrl = `${BASE_URL}/files/${file._id}/preview?token=${token}`;

  // For text files, fetch the content
  useEffect(() => {
    if (previewType === "text") {
      setLoadingText(true);
      fetch(previewUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.text())
        .then((t) => { setTextContent(t); setLoadingText(false); })
        .catch(() => setLoadingText(false));
    }
  }, [previewType, previewUrl, token]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const renderPreview = () => {
    switch (previewType) {
      case "image":
        return (
          <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: "65vh" }}
            />
          </div>
        );

      case "pdf":
        return (
          <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height: "65vh" }}>
            <iframe
              src={`${previewUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full"
              title={file.name}
            />
          </div>
        );

      case "video":
        return (
          <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <video
              controls
              autoPlay={false}
              className="max-w-full rounded-lg"
              style={{ maxHeight: "65vh" }}
            >
              <source src={previewUrl} type={file.mimeType} />
              Your browser does not support video playback.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <p className="text-gray-600 font-medium">{file.name}</p>
            <audio controls className="w-full max-w-md">
              <source src={previewUrl} type={file.mimeType} />
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case "text":
        return (
          <div className="w-full rounded-lg border border-gray-200 overflow-hidden" style={{ height: "65vh" }}>
            {loadingText ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading...
              </div>
            ) : (
              <pre className="p-4 text-sm text-gray-800 overflow-auto h-full font-mono bg-gray-50 whitespace-pre-wrap">
                {textContent}
              </pre>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              <FileText size={36} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Preview not available for this file type</p>
            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={16} /> Download to view
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatBytes(file.size)} · {file.mimeType} · {formatDate(file.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              onClick={() => window.open(previewUrl, "_blank")}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <ExternalLink size={14} /> Open
            </button>
            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={14} /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6">
          {renderPreview()}
        </div>

        {/* Footer with file info */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-6 text-xs text-gray-400">
          <span>Downloads: {file.downloadCount}</span>
          <span>ID: {file.uniqueId.slice(0, 8)}...</span>
          {file.shareToken && <span className="text-green-500">● Shared</span>}
          {file.isStarred && <span className="text-yellow-500">★ Starred</span>}
        </div>
      </div>
    </div>
  );
}
