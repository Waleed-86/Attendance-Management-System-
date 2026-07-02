import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard,CalendarCheck,CalendarClock,History,UserCircle,  Users,  ClipboardList,  BarChart3,ShieldCheck,ListChecks,Menu,X,LogOut,ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const userNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/leave", label: "Leave", icon: CalendarClock },
  { to: "/attendance-history", label: "History", icon: History },
  { to: "/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/leave", label: "Leave Requests", icon: CalendarClock },
  { to: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/grade-settings", label: "Grading", icon: BarChart3 },
  { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
];

export default function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const nav = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    await logout();
    showToast("You've been signed out.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-brand-800 text-white flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
              <CalendarCheck size={16} />
            </div>
            <span className="font-display font-bold">AttendX</span>
          </div>
          <button
            className="lg:hidden text-white/80"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/admin/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-brand-100 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
          <button
            className="lg:hidden text-ink-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
              {isAdmin ? "Admin panel" : "Employee panel"}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50"
            >
              <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm overflow-hidden">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-ink-800">
                {user?.name}
              </span>
              <ChevronDown size={16} className="text-ink-400" />
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-ink-100 bg-white shadow-lg z-20 py-1">
                  <NavLink
                    to={isAdmin ? "/admin/dashboard" : "/profile"}
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    My profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}