import { Link, useLocation } from "react-router-dom";
import { HardDrive, Star, Trash2, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  onUploadClick: () => void;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "My Drive", icon: HardDrive },
    { path: "/starred", label: "Starred", icon: Star },
    { path: "/trash", label: "Trash", icon: Trash2 },
  ];

  const storagePercent = user
    ? Math.round((user.storageUsed / user.storageLimit) * 100)
    : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <aside className="w-64 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 fixed left-0 top-0 transition-colors">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">C</div>
        <span className="text-xl font-semibold text-gray-800 dark:text-white">CloudNova</span>
      </div>

      <button
        onClick={onUploadClick}
        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-3 mb-4 shadow-sm hover:shadow-md transition font-medium text-gray-700 dark:text-gray-200"
      >
        <Upload size={20} className="text-gray-500 dark:text-gray-400" />
        New Upload
      </button>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition ${
              location.pathname === path
                ? "bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {user && (
        <div className="mt-auto px-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(user.storageUsed)} of {formatBytes(user.storageLimit)} used
          </p>
        </div>
      )}
    </aside>
  );
}
