import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, AlertCircle } from "lucide-react";

const BASE_URL = "http://localhost:5001/api";

interface SharedFile {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  downloadCount: number;
}

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

const getFileIcon = (mimeType: string): { color: string; label: string } => {
  if (mimeType.startsWith("image/")) return { color: "bg-green-100 text-green-700", label: "IMG" };
  if (mimeType === "application/pdf") return { color: "bg-red-100 text-red-700", label: "PDF" };
  if (mimeType.startsWith("video/")) return { color: "bg-purple-100 text-purple-700", label: "VID" };
  if (mimeType.startsWith("audio/")) return { color: "bg-yellow-100 text-yellow-700", label: "AUD" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return { color: "bg-green-100 text-green-700", label: "XLS" };
  if (mimeType.includes("document") || mimeType.includes("word")) return { color: "bg-blue-100 text-blue-700", label: "DOC" };
  return { color: "bg-gray-100 text-gray-600", label: "FILE" };
};

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/files/share/${token}`);
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        setFile(data.file);
      } catch {
        setError("This share link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedFile();
  }, [token]);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      const res = await fetch(`${BASE_URL}/files/share/${token}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", file.originalName);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const canPreview = (mimeType: string) =>
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Link Not Found</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <a href="/" className="mt-6 inline-block text-primary text-sm hover:underline">
            Go to CloudNova
          </a>
        </div>
      </div>
    );
  }

  if (!file) return null;

  const { color, label } = getFileIcon(file.mimeType);
  const previewUrl = `${BASE_URL}/files/share/${token}/preview`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">D</div>
        <span className="text-lg font-semibold text-gray-800">CloudNova</span>
        <span className="text-gray-300 mx-2">|</span>
        <span className="text-sm text-gray-500">Shared file</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-2xl overflow-hidden">

          {/* File info header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-sm font-bold shrink-0`}>
                {label}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{file.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <span>{formatBytes(file.size)}</span>
                  <span>·</span>
                  <span>{formatDate(file.createdAt)}</span>
                  <span>·</span>
                  <span>{file.downloadCount} downloads</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                <Download size={18} />
                {downloading ? "Downloading..." : "Download"}
              </button>
              {canPreview(file.mimeType) && (
                <button
                  onClick={() => setPreviewing(!previewing)}
                  className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <FileText size={18} />
                  {previewing ? "Hide Preview" : "Preview"}
                </button>
              )}
            </div>
          </div>

          {/* Preview area */}
          {previewing && (
            <div className="p-6">
              {file.mimeType.startsWith("image/") && (
                <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="max-w-full max-h-96 object-contain rounded-xl"
                  />
                </div>
              )}
              {file.mimeType === "application/pdf" && (
                <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "500px" }}>
                  <iframe src={previewUrl} className="w-full h-full" title={file.name} />
                </div>
              )}
              {file.mimeType.startsWith("video/") && (
                <div className="flex items-center justify-center bg-black rounded-xl overflow-hidden">
                  <video controls className="max-w-full max-h-96 rounded-xl">
                    <source src={previewUrl} type={file.mimeType} />
                  </video>
                </div>
              )}
              {file.mimeType.startsWith("audio/") && (
                <div className="flex justify-center py-6">
                  <audio controls className="w-full max-w-md">
                    <source src={previewUrl} type={file.mimeType} />
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Shared via CloudNova · File type: {file.mimeType}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
