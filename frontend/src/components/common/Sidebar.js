import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, PlusCircle, BarChart2,
  Users, UserPlus, School, BookMarked, TrendingUp, LogOut, ChevronLeft,
  FolderOpen, Gamepad2, BookOpenText, Globe, PenLine, Languages,
} from 'lucide-react';

const TEACHER_NAV = [
  { to: '/teacher/dashboard',   label: 'Dashboard',       Icon: LayoutDashboard },
  { to: '/teacher/classrooms',  label: 'My Classrooms',   Icon: BookOpen         },
  { to: '/teacher/enrollments', label: 'Enrollments',     Icon: ClipboardCheck   },
  { to: '/teacher/add-content', label: 'Upload Content',  Icon: PlusCircle       },
  { to: '/teacher/content',     label: 'My Content',      Icon: FolderOpen       },
  { to: '/teacher/performance', label: 'Performance',     Icon: BarChart2        },
  { to: '/teacher/vocabulary',  label: 'Manage Vocab',    Icon: Languages        },
];

const PARENT_NAV = [
  { to: '/parent/dashboard', label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/parent/students',  label: 'My Students',    Icon: Users            },
  { to: '/parent/enroll',    label: 'Enroll Student', Icon: UserPlus         },
];

const STUDENT_NAV = [
  { to: '/student/dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/student/classroom',  label: 'My Classroom',     Icon: School           },
  { to: '/student/content',    label: 'Learning Content', Icon: BookMarked       },
  { to: '/student/activities', label: 'Activities',       Icon: Gamepad2         },
  { to: '/student/reading',    label: 'Reading Space',    Icon: BookOpenText     },
  { to: '/student/language',   label: 'Language Learning',Icon: Globe            },
  { to: '/student/writing',    label: 'Writing Helper',   Icon: PenLine          },
  { to: '/student/progress',   label: 'My Progress',      Icon: TrendingUp       },
];

const navByRole = {
  teacher: TEACHER_NAV,
  parents: PARENT_NAV,
  student: STUDENT_NAV,
};

const roleLabels = {
  teacher: 'Teacher',
  parents: 'Parent',
  student: 'Student',
};

const roleBadge = {
  teacher: 'bg-brand-500/20 text-brand-300',
  parents: 'bg-violet-500/20 text-violet-300',
  student: 'bg-emerald-500/20 text-emerald-300',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        flex flex-col bg-navy-900 h-screen sticky top-0
        transition-all duration-300 ease-in-out shadow-sidebar
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* ── Brand ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              LB
            </div>
            <span className="text-base font-bold text-white tracking-tight">Learn-Buddy</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60
                      transition-colors flex-shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* ── User badge ────────────────────────────────────────────────── */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5
                            ${roleBadge[user.role] || 'bg-slate-700 text-slate-300'}`}>
            {roleLabels[user.role] || user.role}
          </span>
        </div>
      )}

      {/* ── Nav links ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors
               ${isActive
                 ? 'bg-brand-600/25 text-brand-300 border border-brand-500/30'
                 : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
               }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ─────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3.5 w-full px-4 py-4 rounded-2xl text-base font-semibold
                     text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors
                     border border-transparent"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
