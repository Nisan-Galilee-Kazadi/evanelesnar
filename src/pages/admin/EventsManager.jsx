import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminLayout from "../../components/AdminLayout";
import { API } from "../../utils/api";

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    image: "",
    status: "upcoming",
    tickets: [{ type: "Standard", price: 0, available: 100, total: 100 }],
  });

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = value;

    // Sync 'available' with 'total' when total changes
    if (field === "total") {
      newTickets[index]["available"] = value;
    }

    setFormData({ ...formData, tickets: newTickets });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      tickets: [
        ...formData.tickets,
        { type: "VIP", price: 0, available: 50, total: 50 },
      ],
    });
  };

  const removeTicketType = (index) => {
    const newTickets = formData.tickets.filter((_, i) => i !== index);
    setFormData({ ...formData, tickets: newTickets });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingEvent
      ? API(`/api/events/${editingEvent._id}`)
      : API("/api/events");

    const method = editingEvent ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchEvents();
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      city: "",
      image: "",
      status: "upcoming",
      tickets: [{ type: "Standard", price: 0, available: 100, total: 100 }],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(API(`/api/events/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 10),
      time: event.time,
      venue: event.venue,
      city: event.city,
      image: event.image,
      status: event.status,
      tickets: event.tickets || [],
    });
    setShowForm(true);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des Événements
          </h1>
          <p className="text-slate-400">
            Créer, modifier ou supprimer des événements
          </p>
        </div>

        {!showForm ? (
          <>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mb-8 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FaPlus /> Ajouter un événement
            </button>

            <div className="grid gap-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {event.title}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(event.date).toLocaleDateString("fr-FR")} à{" "}
                        {event.time} • {event.venue}, {event.city}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === "upcoming"
                            ? "bg-green-500/10 text-green-500"
                            : event.status === "soldout"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 p-8 rounded-xl border border-slate-800 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingEvent ? "Modifier l'événement" : "Nouvel événement"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 mb-2">Titre</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2">Heure</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 mb-2">
                    Lieu (Salle)
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none h-32"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-slate-400">
                    Types de Billets
                  </label>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="text-sm text-purple-500 hover:text-purple-400 font-semibold"
                  >
                    + Ajouter un type
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded border border-slate-800 relative"
                    >
                      <input
                        type="text"
                        placeholder="Nom (ex: Standard)"
                        value={ticket.type}
                        onChange={(e) =>
                          handleTicketChange(index, "type", e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Prix"
                        value={ticket.price}
                        onChange={(e) =>
                          handleTicketChange(index, "price", e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantité"
                        value={ticket.total}
                        onChange={(e) =>
                          handleTicketChange(index, "total", e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-purple-500 outline-none"
                >
                  <option value="upcoming">À venir</option>
                  <option value="selling-fast">Vente rapide</option>
                  <option value="soldout">Complet</option>
                  <option value="past">Passé</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold transition-colors"
                >
                  {editingEvent ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EventsManager;
