import { useState, useEffect } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaCreditCard,
} from "react-icons/fa";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API("/api/orders"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(API("/api/events"));
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEvents();
  }, []);

  const handleValidate = async (orderId) => {
    if (
      !window.confirm(
        "Confirmer la réception du paiement pour cette commande ?"
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API(`/api/orders/${orderId}/validate`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchOrders();
        alert("Commande validée avec succès !");
      } else {
        alert("Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Error validating order:", error);
      alert("Erreur serveur");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.paymentStatus === statusFilter;
    const matchesEvent =
      eventFilter === "all" || order.event?._id === eventFilter;

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const getPaymentMethodName = (method) => {
    const methods = {
      mpesa: "M-Pesa",
      orange: "Orange Money",
      airtel: "Airtel Money",
      africell: "Africell Money",
    };
    return methods[method] || method;
  };

  const pendingCount = orders.filter(
    (o) => o.paymentStatus === "pending"
  ).length;
  const validatedCount = orders.filter(
    (o) => o.paymentStatus === "validated"
  ).length;

  return (
    <AdminLayout>
      <div className=" px-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Ventes
          </h1>
          <p className="text-slate-400">Consulter et valider les commandes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">Total Commandes</div>
            <div className="text-3xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="bg-slate-900 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">En Attente</div>
            <div className="text-3xl font-bold text-yellow-500">
              {pendingCount}
            </div>
          </div>
          <div className="bg-slate-900 border border-green-500/20 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">Validées</div>
            <div className="text-3xl font-bold text-green-500">
              {validatedCount}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validées</option>
            </select>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none"
            >
              <option value="all">Tous les événements</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <div className="text-slate-400 text-lg">
                Aucune commande trouvée
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order._id ? null : order._id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-slate-400 text-xs mb-1">
                          Client
                        </div>
                        <div className="font-semibold text-white">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-slate-400">
                          {order.customerPhone}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">
                          Événement
                        </div>
                        <div className="text-white">
                          {order.event?.title || "Supprimé"}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Total</div>
                        <div className="text-purple-400 font-bold text-lg">
                          {order.totalAmount.toLocaleString()} CDF
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-xs mb-1">
                            Statut
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "validated"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {order.paymentStatus === "validated"
                              ? "VALIDÉ"
                              : "EN ATTENTE"}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {expandedOrder === order._id ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order._id && (
                  <div className="border-t border-slate-800 p-6 bg-slate-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FaEnvelope className="text-purple-500" />
                          Informations Client
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Nom:</span>
                            <span className="text-white">
                              {order.customerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-slate-400 transform rotate-90" />
                            <span className="text-white">
                              {order.customerPhone}
                            </span>
                          </div>
                          {order.customerEmail && (
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-slate-400" />
                              <span className="text-white">
                                {order.customerEmail}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Info */}
                      <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FaCalendar className="text-purple-500" />
                          Détails Commande
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">ID:</span>
                            <span className="text-white font-mono">
                              {order._id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaCreditCard className="text-slate-400" />
                            <span className="text-white">
                              {getPaymentMethodName(order.paymentMethod)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Date:</span>
                            <span className="text-white">
                              {new Date(order.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          {order.token && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Token:</span>
                              <span className="text-green-500 font-mono font-bold">
                                {order.token}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tickets */}
                      <div className="md:col-span-2">
                        <h3 className="text-white font-semibold mb-4">
                          Billets
                        </h3>
                        <div className="bg-slate-900 rounded-lg p-4">
                          {order.tickets.map((ticket, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0"
                            >
                              <span className="text-white">
                                {ticket.quantity}x {ticket.type}
                              </span>
                              <span className="text-purple-400 font-semibold">
                                {(
                                  ticket.price * ticket.quantity
                                ).toLocaleString()}{" "}
                                CDF
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-purple-500/20">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-purple-400 font-bold text-xl">
                              {order.totalAmount.toLocaleString()} CDF
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      {order.paymentStatus !== "validated" && (
                        <div className="md:col-span-2">
                          <button
                            onClick={() => handleValidate(order._id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                          >
                            ✓ Valider le Paiement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
