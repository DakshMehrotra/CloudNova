import { useState } from "react";
import { Search, LogOut, User, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onSearch: (q: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 gap-4 fixed top-0 left-64 right-0 z-10 transition-colors">
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 gap-3">
          <Search size={18} className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") onSearch("");
            }}
            placeholder="Search in CloudNova"
            className="bg-transparent flex-1 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <User size={16} />
          <span className="hidden md:block">{user?.name}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
