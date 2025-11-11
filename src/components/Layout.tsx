import { User } from '../App';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TestTube,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  Stethoscope,
  ClipboardList,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

export function Layout({
  user,
  currentPage,
  onNavigate,
  onLogout,
  theme,
  onToggleTheme,
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['superadmin', 'reception', 'laboratory', 'doctor', 'cashier'],
    },
    {
      id: 'register-patient',
      label: 'Bemor ro\'yxatga olish',
      icon: <UserPlus className="w-5 h-5" />,
      roles: ['reception'],
    },
    {
      id: 'patient-queue',
      label: 'Navbat',
      icon: <ClipboardList className="w-5 h-5" />,
      roles: ['reception'],
    },
    {
      id: 'test-results',
      label: 'Tahlillar',
      icon: <TestTube className="w-5 h-5" />,
      roles: ['laboratory'],
    },
    {
      id: 'consultations',
      label: 'Bemorlar',
      icon: <Stethoscope className="w-5 h-5" />,
      roles: ['doctor'],
    },
    {
      id: 'payment-processing',
      label: 'To\'lov qabul qilish',
      icon: <DollarSign className="w-5 h-5" />,
      roles: ['cashier'],
    },
    {
      id: 'user-management',
      label: 'Foydalanuvchilar',
      icon: <Users className="w-5 h-5" />,
      roles: ['superadmin'],
    },
    {
      id: 'reports',
      label: 'Hisobotlar',
      icon: <FileText className="w-5 h-5" />,
      roles: ['superadmin', 'reception'],
    },
    {
      id: 'settings',
      label: 'Sozlamalar',
      icon: <Settings className="w-5 h-5" />,
      roles: ['superadmin'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setSidebarOpen(false);
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
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${
                      currentPage === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
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
                  {user.fullName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTheme}
                className="flex-1"
              >
                {theme === 'light' ? (
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