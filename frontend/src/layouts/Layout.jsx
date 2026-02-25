import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const employeeNav = [
  { to: '/dashboard/employee', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', exact: true },
  { to: '/dashboard/employee/apply', label: 'Apply Leave', icon: 'M12 5v14M5 12h14' },
  { to: '/dashboard/employee/leaves', label: 'My Leaves', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/dashboard/employee/attendance', label: 'Attendance', icon: 'M12 2v10l4 4' },
];

const managerNav = [
  { to: '/dashboard/manager', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', exact: true },
  { to: '/dashboard/manager/leaves', label: 'Leave Requests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/dashboard/manager/analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { to: '/dashboard/manager/rules', label: 'Rule Engine', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const nav = user?.role === 'manager' ? managerNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate(`/login/${user?.role || 'employee'}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex flex-col bg-surface-900 border-r border-surface-200/10 transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-200/10">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          {!collapsed && <span className="font-semibold text-white text-sm tracking-tight">LeaveFlow</span>}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className={user?.role === 'manager' ? 'badge-blue' : 'badge-green'}>
              {user?.role === 'manager' ? '⚡ Manager' : '👤 Employee'}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 font-medium'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-200/5'
                }`
              }
            >
              <Icon d={item.icon} size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-surface-200/10 p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full bg-primary-600/30 text-primary-400 text-xs flex items-center justify-center font-medium flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-100 truncate">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate">{user?.department}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={16} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-surface-200/10 bg-surface-900/50 backdrop-blur flex items-center justify-between px-6">
          <button onClick={() => setCollapsed(!collapsed)} className="text-surface-400 hover:text-surface-100 transition-colors">
            <Icon d="M4 6h16M4 12h16M4 18h16" size={18} />
          </button>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-surface-400 hover:text-surface-100 transition-colors p-1"
              >
                <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-8 w-80 card shadow-2xl shadow-black/50 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-200/10 text-sm font-medium text-surface-200">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-surface-400">No notifications</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 border-b border-surface-200/5 text-sm text-surface-300 hover:bg-surface-200/5">
                          {n.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-surface-400">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
