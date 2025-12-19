import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaUsers,
  FaMoneyBillWave,
  FaArrowRight,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalOrders: 0,
    pendingOrders: 0,
    validatedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch events
        const eventsRes = await fetch(API("/api/events"));
        const events = await eventsRes.json();

        // Fetch orders
        const ordersRes = await fetch(API("/api/orders"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = await ordersRes.json();

        const upcomingEvents = events.filter(
          (e) => new Date(e.date) >= new Date()
        );
        const pendingOrders = orders.filter(
          (o) => o.paymentStatus === "pending"
        );
        const validatedOrders = orders.filter(
          (o) => o.paymentStatus === "validated"
        );
        const totalRevenue = validatedOrders.reduce(
          (sum, o) => sum + o.totalAmount,
          0
        );

        setStats({
          totalEvents: events.length,
          upcomingEvents: upcomingEvents.length,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          validatedOrders: validatedOrders.length,
          totalRevenue,
        });

        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Événements",
      value: stats.totalEvents,
      subtitle: `${stats.upcomingEvents} à venir`,
      icon: FaCalendarAlt,
      color: "purple",
      link: "/admin/events",
    },
    {
      title: "Commandes",
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} en attente`,
      icon: FaTicketAlt,
      color: "blue",
      link: "/admin/orders",
    },
    {
      title: "Validées",
      value: stats.validatedOrders,
      subtitle: "Paiements confirmés",
      icon: FaUsers,
      color: "green",
      link: "/admin/orders",
    },
    {
      title: "Revenus",
      value: `${(stats.totalRevenue / 1000).toFixed(0)}K`,
      subtitle: "CDF",
      icon: FaMoneyBillWave,
      color: "orange",
      link: "/admin/orders",
    },
  ];

  return (
    <AdminLayout>
      <div className=" px-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord
          </h1>
          <p className="text-slate-400">Vue d'ensemble de votre activité</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              purple: "from-purple-500 to-purple-600",
              blue: "from-blue-500 to-blue-600",
              green: "from-green-500 to-green-600",
              orange: "from-orange-500 to-orange-600",
            };

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={stat.link}>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-br ${
                          colorClasses[stat.color]
                        } rounded-lg`}
                      >
                        <Icon className="text-white" size={24} />
                      </div>
                      <FaArrowRight className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-sm font-medium mb-1">
                      {stat.title}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {stat.subtitle}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-purple-500" />
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Link to="/admin/events">
                <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-purple-500" />
                      <span className="text-white font-medium">
                        Créer un événement
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              </Link>
              <Link to="/admin/orders">
                <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaTicketAlt className="text-green-500" />
                      <span className="text-white font-medium">
                        Voir les commandes
                      </span>
                    </div>
                    <FaArrowRight className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Commandes récentes
            </h2>
            {loading ? (
              <div className="text-slate-400 text-center py-8">
                Chargement...
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">
                        {order.customerName}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.paymentStatus === "validated"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {order.paymentStatus === "validated"
                          ? "Validé"
                          : "En attente"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {order.event?.title || "Événement supprimé"}
                    </div>
                    <div className="text-sm text-purple-400 font-semibold mt-1">
                      {order.totalAmount.toLocaleString()} CDF
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-8">
                Aucune commande
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
