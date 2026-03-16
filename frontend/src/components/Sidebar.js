import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const navigation = isAdmin
    ? [
        { name: 'Dashboard', icon: Home, path: '/admin', testId: 'nav-admin-dashboard' },
        { name: 'All Complaints', icon: FileText, path: '/admin/complaints', testId: 'nav-admin-complaints' },
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics', testId: 'nav-admin-analytics' },
      ]
    : [
        { name: 'Dashboard', icon: Home, path: '/dashboard', testId: 'nav-student-dashboard' },
        { name: 'My Complaints', icon: FileText, path: '/complaints', testId: 'nav-student-complaints' },
      ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-gold">Complaint Portal</h2>
              <p className="text-xs text-gray-400 mt-1">{user?.role === 'admin' ? 'Admin Panel' : 'Student Panel'}</p>
            </div>
            <button onClick={onClose} className="lg:hidden text-sidebar-foreground hover:text-gold" data-testid="sidebar-close-button">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium" data-testid="user-name">{user?.name}</p>
                <p className="text-xs text-gray-400" data-testid="user-email">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gold text-white shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-gold"
                  )}
                  data-testid={item.testId}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start space-x-3 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-hover hover:text-gold"
              data-testid="logout-button"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-warm-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-heading text-lg font-semibold">Complaint Portal</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page content */}
        <main className="p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
