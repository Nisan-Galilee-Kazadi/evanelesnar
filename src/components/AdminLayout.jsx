import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminFooter from "./AdminFooter";
import logo from "../images/logo.png";
import {
  FaHome,
  FaCalendarAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaUser,
  FaPhotoVideo,
  FaCog,
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
    { path: "/admin/media", icon: FaPhotoVideo, label: "Médias" },
    { path: "/admin/settings", icon: FaCog, label: "Paramètres" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => {
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen ${isCollapsed ? "w-20" : "w-64"
          } bg-slate-900 border-r border-slate-800 flex flex-col transform transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:fixed`}
      >
        {/* En-tête mobile */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between md:hidden">
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              <span className="text-white">Evan</span>
              <span className="text-gradient"> Admin</span>
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Logo */}
        <div className="hidden md:block p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-white">Evan</span>
                  <span className="text-gradient"> Admin</span>
                </h1>
                {/* <p className="text-slate-400 text-sm mt-1">
                  Gestion des spectacles
                </p> */}
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900 rounded mx-auto overflow-hidden p-0.5">
                <img src={logo} alt="Logo" className="w-full h-full object-contain contrast-125 brightness-90 saturate-150" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed((s) => !s)}
              className="text-slate-300 hover:text-white p-2 rounded-md hidden md:block"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        </div>

        {/* Info admin */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center text-white overflow-hidden p-0.5">
              <FaUser />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">
                  {admin.name || "Admin"}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {admin.email || "evanebukasa@gmail.com"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
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
                  }}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
                    } px-4 py-3 rounded-lg transition-all ${isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
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

        {/* Déconnexion */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
              } w-full px-4  text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors`}
          >
            <FaSignOutAlt size={20} />
            {!isCollapsed && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64">
        {/* Barre de navigation supérieure */}
        <header className="bg-slate-950 border-b border-slate-800 h-20 flex items-center justify-between px-4  static w-full md:px-8 z-10">
          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <FaBars size={20} />
          </button>

          {/* Titre (masqué sur mobile) */}
          <h1 className="hidden md:block text-xl font-bold">
            <span className="text-white">Tableau de bord</span>
          </h1>

          {/* Info utilisateur */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center text-white font-semibold overflow-hidden p-0.5">
                {admin.photo ? (
                  <img
                    src={admin.photo}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <img
                    src={logo}
                    alt="avatar"
                    className="w-full h-full object-contain contrast-125 brightness-90 saturate-150"
                  />
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-white font-semibold">
                  {admin.name || 'Admin'}
                </div>
                <div className="text-slate-400 text-xs">
                  {admin.role || 'Administrateur'}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center text-white font-semibold overflow-hidden p-0.5">
                {admin.photo ? (
                  <img
                    src={admin.photo}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <img
                    src={logo}
                    alt="avatar"
                    className="w-full h-full object-contain contrast-125 brightness-90 saturate-150"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto bg-slate-950 px-4 sm:px-6 py-6">
          {children}
        </main>

        {/* Footer Admin */}
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
