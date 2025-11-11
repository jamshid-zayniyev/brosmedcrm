import { useUserStore } from "../stores/user.store";
import { Button } from "./ui/button";
import { LayoutDashboard, LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleStorage } from "../utils/handle-storage";
import { defaultRoutes, privateRoutes } from "../router";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  path: string;
}

const roleMap: { [key: string]: string } = {
  s: "Superadmin",
  r: "Receptionist",
  l: "Laboratory",
  d: "Doctor",
  c: "Cashier",
};

export function Layout({ children }: LayoutProps) {
  const { user, setUser } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems: MenuItem[] = privateRoutes.map((route) => ({
    id: route.path,
    label:
      route.path
        .split("/")
        .pop()
        ?.replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: route.allowedRoles,
    path: route.path,
  }));

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const onLogout = () => {
    handleStorage({ key: "access_token", value: null });
    setUser(null);
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-accent rounded-md"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <h2>Klinika</h2>
        <div className="w-10" />
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <h2 className="text-primary">Klinika Tizimi</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* User Info & Actions */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground">
                  {user?.full_name ? user?.full_name.charAt(0) : "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {roleMap[user?.role] || user?.role}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
