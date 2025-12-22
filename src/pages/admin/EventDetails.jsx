import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaBan,
} from "react-icons/fa";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchEvent = async () => {
    const response = await fetch(API(`/api/events/${id}`));
    if (!response.ok) throw new Error("Erreur lors du chargement de l'événement");
    return response.json();
  };

  const fetchOrders = async () => {
    const response = await fetch(API(`/api/orders?eventId=${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Erreur lors du chargement des commandes");
    return response.json();
  };

  const reload = async () => {
    setLoading(true);
    try {
      const [evt, ord] = await Promise.all([fetchEvent(), fetchOrders()]);
      setEvent(evt);
      setOrders(ord);
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e?.message || "Erreur lors du chargement",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.paymentStatus === "pending").length;
    const validated = orders.filter((o) => o.paymentStatus === "validated").length;
    const cancelled = orders.filter((o) => o.paymentStatus === "cancelled").length;
    return { pending, validated, cancelled, total: orders.length };
  }, [orders]);

  const validatedByTicketType = useMemo(() => {
    const validatedOrders = orders.filter((o) => o.paymentStatus === "validated");

    const grouped = {};
    for (const o of validatedOrders) {
      const tickets = Array.isArray(o.tickets) ? o.tickets : [];
      for (const t of tickets) {
        const type = t?.type || "Standard";
        const qty = Number(t?.quantity || 0);
        if (!grouped[type]) grouped[type] = { qty: 0, orders: [] };
        grouped[type].qty += qty;
        grouped[type].orders.push({ order: o, ticket: t });
      }
    }

    return grouped;
  }, [orders]);

  const handleValidateOrder = async (orderId) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Valider le paiement ?",
      text: "Confirmer la réception du paiement et envoyer le token ?",
      showCancelButton: true,
      confirmButtonText: "Oui, valider",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(API(`/api/orders/${orderId}/validate`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Erreur lors de la validation");
      }

      await Swal.fire({
        icon: "success",
        title: "Commande validée",
        text: "Le token a été généré et envoyé au client.",
        confirmButtonColor: "#dc2626",
      });

      await reload();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e?.message || "Erreur serveur",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Révoquer l'accès ?",
      text: "Cette action annule la commande et désactive le token.",
      showCancelButton: true,
      confirmButtonText: "Oui, révoquer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(API(`/api/orders/${orderId}/cancel`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Erreur lors de l'annulation");
      }

      await Swal.fire({
        icon: "success",
        title: "Accès révoqué",
        text: "La commande a été annulée.",
        confirmButtonColor: "#dc2626",
      });

      await reload();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e?.message || "Erreur serveur",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-2">
          <div className="text-slate-400">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="px-2">
          <div className="text-slate-400">Événement introuvable</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-2">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="text-slate-400 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-red-500" />
                <span>
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-red-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                <span>
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 bg-black border border-slate-800 text-white px-4 py-2 rounded-lg hover:border-red-500 transition-colors"
          >
            <FaArrowLeft /> Retour
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2">Total demandes</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-black border border-yellow-500/20 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
              <FaHourglassHalf className="text-yellow-500" /> En attente
            </div>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </div>
          <div className="bg-black border border-green-500/20 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" /> Payées
            </div>
            <div className="text-3xl font-bold text-green-500">{stats.validated}</div>
          </div>
          <div className="bg-black border border-red-500/20 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-2 flex items-center gap-2">
              <FaBan className="text-red-500" /> Annulées
            </div>
            <div className="text-3xl font-bold text-red-500">{stats.cancelled}</div>
          </div>
        </div>

        <div className="bg-black border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Description</h2>
          <p className="text-slate-400 leading-relaxed">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUsers className="text-red-400" /> Participants payés (par catégorie)
            </h2>

            {Object.keys(validatedByTicketType).length === 0 ? (
              <div className="text-slate-400">Aucun paiement validé pour le moment.</div>
            ) : (
              <div className="space-y-5">
                {Object.entries(validatedByTicketType).map(([type, group]) => (
                  <div key={type} className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-black flex items-center justify-between">
                      <div className="text-white font-semibold">{type}</div>
                      <div className="text-slate-400 text-sm">{group.qty} billets</div>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {group.orders.map(({ order, ticket }) => (
                        <div key={`${order._id}-${ticket.type}`} className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">{order.customerName}</div>
                            <div className="text-slate-400 text-sm truncate">
                              {order.customerEmail || "—"} • {order.customerPhone}
                            </div>
                            <div className="text-slate-500 text-xs">
                              {ticket.quantity} x {ticket.type} • {order.totalAmount.toLocaleString()} CDF
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="px-3 py-2 bg-black border border-slate-800 text-white rounded-lg hover:border-red-500 transition-colors"
                            >
                              Révoquer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Demandes à valider</h2>

            {orders.filter((o) => o.paymentStatus === "pending").length === 0 ? (
              <div className="text-slate-400">Aucune demande en attente.</div>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter((o) => o.paymentStatus === "pending")
                  .map((o) => (
                    <div
                      key={o._id}
                      className="border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">{o.customerName}</div>
                        <div className="text-slate-400 text-sm truncate">
                          {o.customerEmail || "—"} • {o.customerPhone}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {Array.isArray(o.tickets)
                            ? o.tickets
                                .map((t) => `${t.quantity}x ${t.type}`)
                                .join(" • ")
                            : "—"}
                          {" • "}
                          {o.totalAmount.toLocaleString()} CDF
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleValidateOrder(o._id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => handleCancelOrder(o._id)}
                          className="px-3 py-2 bg-black border border-slate-800 text-white rounded-lg hover:border-red-500 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventDetails;
