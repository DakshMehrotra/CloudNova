import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-md transition-colors">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">C</div>
          <span className="text-2xl font-semibold text-gray-800 dark:text-white">CloudNova</span>
        </div>
        <h2 className="text-xl font-medium text-center text-gray-700 dark:text-gray-300 mb-6">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
