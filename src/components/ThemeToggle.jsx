import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-md)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        fontSize: "14px",
        fontWeight: "500"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-tertiary)";
        e.currentTarget.style.borderColor = "var(--border-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-elevated)";
        e.currentTarget.style.borderColor = "var(--border-primary)";
      }}
      title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      <span>{theme === "dark" ? "Clair" : "Sombre"}</span>
    </button>
  );
}

export default ThemeToggle;
