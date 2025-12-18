import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaChartLine,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin/dashboard", icon: FaHome, label: "Tableau de bord" },
    { path: "/admin/events", icon: FaCalendarAlt, label: "Événements" },
    { path: "/admin/orders", icon: FaTicketAlt, label: "Commandes" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Expand sidebar when navigating to a new route (user asked it to auto-open)
  useEffect(() => {
    // Schedule state updates on next tick to avoid synchronous setState in effect
    if (isCollapsed || isOpen) {
      const id = setTimeout(() => {
        if (isCollapsed) setIsCollapsed(false);
        if (isOpen) setIsOpen(false);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [location.pathname, isCollapsed, isOpen]);

  return (
    <div
      className="min-h-screen bg-slate-950 flex"
      style={{ "--admin-sidebar-width": isCollapsed ? "5rem" : "16rem" }}
    >
      {/* Top navigation (aligned right and offset from sidebar on md+) */}
      <header
        className={`fixed top-0 ${
          isCollapsed ? "md:left-20" : "md:left-64"
        } right-0 z-50 bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-end px-4 md:px-8`}
      >
        {/* Right: name (desktop) + photo (all sizes) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center text-right mr-2">
            <span className="text-white font-semibold truncate max-w-[220px]">
              Evan Lesnar
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden text-purple-500 font-semibold">
            {admin.photo ? (
              <img
                src={admin.photo}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              "EL"
            )}
          </div>
        </div>
      </header>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        } bg-slate-900 border-r border-slate-800 flex flex-col transform transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:h-screen md:inset-y-0`}
      >
        {/* Mobile header with close */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between md:hidden">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-white">Evan</span>
              <span className="text-gradient"> Admin</span>
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="hidden md:block p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-white">Evan</span>
                  <span className="text-gradient"> Admin</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Gestion des spectacles
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <h1 className="text-lg font-bold text-white">E</h1>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed((s) => !s)}
              className="text-slate-300 hover:text-white p-2 rounded-md"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500">
              <FaUser />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">
                  {admin.name || "Admin"}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {admin.email || "admin@evanlesnar.com"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setIsOpen(false);
                    setIsCollapsed(false);
                  }}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-4 py-3"
            } rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all`}
          >
            <FaSignOutAlt size={20} />
            {!isCollapsed && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ml-0 ${isCollapsed ? "md:ml-20" : "md:ml-64"} pt-16`}
      >
        {/* Mobile menu button (floating) */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-60 p-2 text-slate-300 bg-transparent"
          aria-label="Open menu"
        >
          <FaBars size={22} />
        </button>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
