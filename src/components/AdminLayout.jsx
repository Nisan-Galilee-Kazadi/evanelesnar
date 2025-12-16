import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaCalendarAlt,
    FaTicketAlt,
    FaSignOutAlt,
    FaChartLine,
    FaUser
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: FaHome, label: 'Tableau de bord' },
        { path: '/admin/events', icon: FaCalendarAlt, label: 'Événements' },
        { path: '/admin/orders', icon: FaTicketAlt, label: 'Commandes' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold">
                        <span className="text-white">Evan</span>
                        <span className="text-gradient"> Admin</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Gestion des spectacles</p>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500">
                            <FaUser />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold truncate">{admin.name || 'Admin'}</div>
                            <div className="text-slate-400 text-xs truncate">{admin.email || 'admin@evanlesnar.com'}</div>
                        </div>
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
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <FaSignOutAlt size={20} />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
