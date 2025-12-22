import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../utils/api";
import {
  FaSearch,
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaMask,
  FaMobileAlt,
  FaCheckCircle,
} from "react-icons/fa";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(API("/api/events"));
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "available")
      return matchesSearch && event.status === "upcoming";
    if (filter === "selling-fast")
      return matchesSearch && event.status === "selling-fast";

    return matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title mb-4">Tous les Spectacles</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Découvrez tous mes spectacles à venir et réservez vos billets en
            quelques clics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un spectacle ou une ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors pl-12"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                  <FaSearch />
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === "all"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:-700"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter("available")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === "available"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Disponibles
              </button>
              <button
                onClick={() => setFilter("selling-fast")}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === "selling-fast"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <FaFire /> Vente rapide
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-20 text-white">Chargement...</div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id}
                className="event-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Event Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

                  {/* Status Badge */}
                  {event.status === "selling-fast" && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                      <FaFire /> Vente rapide
                    </div>
                  )}

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-slate-300">
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-gradient transition-all">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4 text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">
                        <FaCalendarAlt />
                      </span>
                      <span>
                        {new Date(event.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">
                        <FaClock />
                      </span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">
                        <FaMapMarkerAlt />
                      </span>
                      <span>
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 mb-6 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Ticket Types */}
                  <div className="mb-4 space-y-2">
                    {event.tickets.map((ticket, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span
                          className={`font-medium flex items-center gap-1 ${
                            ticket.type === "VIP"
                              ? "text-gradient-gold"
                              : "text-slate-400"
                          }`}
                        >
                          {ticket.type === "VIP" && (
                            <FaStar className="text-yellow-500" />
                          )}
                          {ticket.type}
                        </span>
                        <span className="text-red-500 font-bold">
                          {ticket.price.toLocaleString()} {ticket.currency}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Available Tickets */}
                  <div className="mb-4 text-sm text-slate-500">
                    {event.tickets.reduce((sum, t) => sum + t.available, 0)}{" "}
                    places disponibles
                  </div>

                  <Link
                    to={`/events/${event._id}`}
                    className="btn btn-primary w-full text-center"
                  >
                    Réserver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 text-slate-600 flex justify-center">
              <FaMask />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucun spectacle trouvé
            </h3>
            <p className="text-slate-400">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 card-glass max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <FaMobileAlt /> Paiement Mobile Money
            </h3>
            <p className="text-slate-400 mb-6">
              Payez facilement vos billets avec M-Pesa, Orange Money, Airtel
              Money ou Africell Money. Recevez votre billet électronique
              instantanément par email et WhatsApp.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Paiement sécurisé
              </div>
              <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Billet instantané
              </div>
              <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> QR Code unique
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
