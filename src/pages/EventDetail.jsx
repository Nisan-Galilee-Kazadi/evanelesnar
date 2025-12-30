import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../utils/api";
import { paymentMethods } from "../data/mockData";
import { generateTicketPDF } from "../utils/ticketPDF";
import Swal from "sweetalert2";
import {
  FaRegSadTear,
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaMobileAlt,
  FaQrcode,
  FaCheckCircle,
  FaArrowLeft,
  FaCheck,
  FaTicketAlt,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [step, setStep] = useState(1); // 1: Selection, 2: Payment, 3: Confirmation, 4: Token Validation
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [pendingOrder, setPendingOrder] = useState(null);
  const [tokenInput, setTokenInput] = useState("");
  const [validatingToken, setValidatingToken] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(API(`/api/events/${id}`));
        if (response.ok) {
          const data = await response.json();
          setEvent(data);

          // Check for pending order in localStorage using event._id
          const pendingOrders = JSON.parse(
            localStorage.getItem("pendingOrders") || "{}"
          );
          if (pendingOrders[data._id]) {
            setPendingOrder(pendingOrders[data._id]);
            setStep(4); // Go to token validation step
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event:", error);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-zinc-600 flex justify-center">
            <FaRegSadTear />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Spectacle introuvable
          </h2>
          <Link to="/events" className="btn btn-primary">
            Retour aux spectacles
          </Link>
        </div>
      </div>
    );
  }

  const handleTicketChange = (ticketType, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketType]: Math.max(0, quantity),
    }));
  };

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce((total, [type, quantity]) => {
      const ticket = event.tickets.find((t) => t.type === type);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleContinue = async () => {
    if (step === 1 && getTotalTickets() > 0) {
      setStep(2);
    } else if (
      step === 2 &&
      selectedPayment &&
      customerInfo.name &&
      customerInfo.phone
    ) {
      setProcessing(true);
      try {
        // Prepare order data
        const ticketsList = Object.entries(selectedTickets)
          .filter(([_, qty]) => qty > 0)
          .map(([type, qty]) => {
            const ticket = event.tickets.find((t) => t.type === type);
            return {
              type,
              quantity: qty,
              price: ticket.price,
            };
          });

        const orderData = {
          eventId: event._id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          tickets: ticketsList,
          totalAmount: getTotalAmount(),
          paymentMethod: selectedPayment,
        };

        const response = await fetch(API("/api/orders"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const order = await response.json();

          // Store order in localStorage
          const pendingOrders = JSON.parse(
            localStorage.getItem("pendingOrders") || "{}"
          );
          pendingOrders[event._id] = {
            orderId: order._id,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));

          setPendingOrder(pendingOrders[event._id]);
          setStep(3);
        } else {
          await Swal.fire({
            icon: "error",
            title: "Commande impossible",
            text: "Erreur lors de la commande.",
          });
        }
      } catch (error) {
        console.error("Error creating order:", error);
        await Swal.fire({
          icon: "error",
          title: "Erreur serveur",
          text: "Impossible de créer la commande pour le moment.",
        });
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleValidateToken = async () => {
    if (!tokenInput.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Token requis",
        text: "Veuillez entrer votre token.",
      });
      return;
    }

    setValidatingToken(true);

    try {
      const response = await fetch(API("/api/orders/verify-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenInput }),
      });

      if (response.ok) {
        const data = await response.json();
        const order = data?.order || data;

        // Generate and download PDF
        await generateTicketPDF(order, event);

        // Clear localStorage for this event
        const pendingOrders = JSON.parse(
          localStorage.getItem("pendingOrders") || "{}"
        );
        delete pendingOrders[event._id];
        localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));

        // Reset state
        setPendingOrder(null);
        setTokenInput("");
        setStep(1);
        setSelectedTickets({});
        setCustomerInfo({ name: "", email: "", phone: "" });
        setSelectedPayment(null);

        await Swal.fire({
          icon: "success",
          title: "Billet téléchargé",
          text: "Votre billet PDF a été téléchargé avec succès.",
        });
      } else {
        const error = await response.json();
        await Swal.fire({
          icon: "error",
          title: "Token invalide",
          text: error.message || "Token invalide",
        });
      }
    } catch (error) {
      console.error("Error validating token:", error);
      await Swal.fire({
        icon: "error",
        title: "Erreur serveur",
        text: "Impossible de valider le token pour le moment.",
      });
    } finally {
      setValidatingToken(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        {/* Event Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden h-96 lg:h-auto">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {event.status === "selling-fast" && (
              <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 text-white font-bold rounded-full animate-pulse flex items-center gap-2">
                <FaFire /> Vente rapide
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {event.title}
            </h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-lg">
                <span className="text-2xl text-red-500">
                  <FaCalendarAlt />
                </span>
                <div>
                  <div className="text-white font-semibold">
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-zinc-400 text-sm">
                    Date du spectacle
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-lg">
                <span className="text-2xl text-red-500">
                  <FaClock />
                </span>
                <div>
                  <div className="text-white font-semibold">{event.time}</div>
                  <div className="text-zinc-400 text-sm">Heure de début</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-lg">
                <span className="text-2xl text-red-500">
                  <FaMapMarkerAlt />
                </span>
                <div>
                  <div className="text-white font-semibold">{event.venue}</div>
                  <div className="text-zinc-400 text-sm">{event.city}</div>
                </div>
              </div>
            </div>

            <p className="text-zinc-300 text-lg leading-relaxed mb-8">
              {event.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card text-center">
                <div className="text-3xl font-bold text-gradient mb-1">
                  {event.tickets.reduce((sum, t) => sum + t.available, 0)}
                </div>
                <div className="text-zinc-400 text-sm">Places disponibles</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-gradient mb-1">
                  {event.tickets[0].price.toLocaleString()}
                </div>
                <div className="text-zinc-400 text-sm">À partir de (CDF)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps - Only show if not in token validation mode */}
          {step !== 4 && (
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${step >= 1 ? "text-red-500" : "text-zinc-600"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-600"
                      }`}
                  >
                    1
                  </div>
                  <span className="hidden sm:inline font-medium">Billets</span>
                </div>
                <div
                  className={`w-16 h-0.5 ${step >= 2 ? "bg-red-600" : "bg-zinc-800"
                    }`}
                ></div>
                <div
                  className={`flex items-center space-x-2 ${step >= 2 ? "text-red-500" : "text-zinc-600"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-600"
                      }`}
                  >
                    2
                  </div>
                  <span className="hidden sm:inline font-medium">Paiement</span>
                </div>
                <div
                  className={`w-16 h-0.5 ${step >= 3 ? "bg-red-600" : "bg-zinc-800"
                    }`}
                ></div>
                <div
                  className={`flex items-center space-x-2 ${step >= 3 ? "text-red-500" : "text-zinc-600"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-600"
                      }`}
                  >
                    3
                  </div>
                  <span className="hidden sm:inline font-medium">
                    Confirmation
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Token Validation */}
          {step === 4 && (
            <div className="card-glass animate-slide-up text-center">
              <div className="text-6xl mb-6 text-red-500 flex justify-center">
                <FaTicketAlt />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Validez votre Token
              </h2>

              <div className="bg-zinc-800/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto border border-zinc-700">
                <p className="text-lg text-white mb-4">
                  {pendingOrder ? "Vous avez une commande en attente pour cet événement." : "Récupérez votre billet à l'aide de votre token."}
                </p>
                <p className="text-zinc-300 mb-6">
                  Entrez le token que vous avez reçu après validation du
                  paiement pour télécharger votre billet.
                </p>

                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Entrez votre token (ex: EL-123456)"
                    value={tokenInput}
                    onChange={(e) =>
                      setTokenInput(e.target.value.toUpperCase())
                    }
                    className="w-full px-6 py-4 bg-black border border-zinc-700 rounded-lg text-white text-center text-xl font-mono placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  onClick={handleValidateToken}
                  disabled={validatingToken || !tokenInput.trim()}
                  className="btn btn-primary w-full text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingToken ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                  {validatingToken ? "Validation..." : "Télécharger mon Billet"}
                </button>
              </div>

              <button
                onClick={() => {
                  // Allow user to make a new booking
                  const pendingOrders = JSON.parse(
                    localStorage.getItem("pendingOrders") || "{}"
                  );
                  delete pendingOrders[event._id];
                  localStorage.setItem(
                    "pendingOrders",
                    JSON.stringify(pendingOrders)
                  );
                  setPendingOrder(null);
                  setStep(1);
                }}
                className="text-zinc-400 hover:text-white transition-colors underline"
              >
                Faire une nouvelle réservation
              </button>
            </div>
          )}

          {/* Step 1: Ticket Selection */}
          {step === 1 && (
            <div className="card-glass animate-slide-up">
              <h2 className="text-3xl font-bold text-white mb-8">
                Sélectionnez vos billets
              </h2>

              <div className="space-y-6 mb-8">
                {event.tickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="card flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 flex items-center gap-2 ${ticket.type === "VIP"
                          ? "text-gradient-gold"
                          : "text-white"
                          }`}
                      >
                        {ticket.type === "VIP" && (
                          <FaStar className="text-yellow-500" />
                        )}
                        {ticket.type}
                      </h3>
                      <div className="text-2xl font-bold text-gradient mb-1">
                        {ticket.price.toLocaleString()} {ticket.currency}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {ticket.available} places disponibles
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          handleTicketChange(
                            ticket.type,
                            (selectedTickets[ticket.type] || 0) - 1
                          )
                        }
                        className="w-10 h-10 bg-zinc-800 hover:bg-red-600 rounded-lg font-bold transition-colors"
                        disabled={!selectedTickets[ticket.type]}
                      >
                        -
                      </button>
                      <div className="w-12 text-center text-2xl font-bold text-white">
                        {selectedTickets[ticket.type] || 0}
                      </div>
                      <button
                        onClick={() =>
                          handleTicketChange(
                            ticket.type,
                            (selectedTickets[ticket.type] || 0) + 1
                          )
                        }
                        className="w-10 h-10 bg-zinc-800 hover:bg-red-600 rounded-lg font-bold transition-colors"
                        disabled={
                          (selectedTickets[ticket.type] || 0) >=
                          ticket.available
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-zinc-700 pt-6 mb-6">
                <div className="flex items-center justify-between text-2xl font-bold mb-2">
                  <span className="text-white">Total</span>
                  <span className="text-gradient">
                    {getTotalAmount().toLocaleString()} CDF
                  </span>
                </div>
                <div className="text-zinc-400 text-right">
                  {getTotalTickets()} billet{getTotalTickets() > 1 ? "s" : ""}
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={getTotalTickets() === 0}
                className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer vers le paiement
              </button>
              <div className="text-center mt-4">
                <button
                  onClick={() => setStep(4)}
                  className="text-zinc-400 hover:text-red-500 transition-colors text-sm underline"
                >
                  Déjà payé ? Valider mon token
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card-glass animate-slide-up">
              <h2 className="text-3xl font-bold text-white mb-8">
                Informations et Paiement
              </h2>

              {/* Customer Info */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Vos informations
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email (facultatif)"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="tel"
                    placeholder="Numéro de téléphone (+243...)"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Choisissez votre méthode de paiement
                </h3>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {paymentMethods.map((method) => {

                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`payment-icon relative rounded-2xl overflow-hidden cursor-pointer transition-all ${selectedPayment === method.id
                          ? "ring-2 ring-red-500 scale-105"
                          : "opacity-70 hover:opacity-100"
                          } flex items-center justify-center mx-auto`}
                      >
                        <img
                          src={method.logo}
                          alt={method.name}
                          className="w-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>



              {/* Summary */}
              <div className="card mb-6">
                <h4 className="font-bold text-white mb-4">Récapitulatif</h4>
                {Object.entries(selectedTickets).map(([type, qty]) => {
                  if (qty === 0) return null;
                  const ticket = event.tickets.find((t) => t.type === type);
                  return (
                    <div
                      key={type}
                      className="flex justify-between text-zinc-400 mb-2"
                    >
                      <span>
                        {qty}x {type}
                      </span>
                      <span>{(ticket.price * qty).toLocaleString()} CDF</span>
                    </div>
                  );
                })}
                <div className="border-t border-zinc-700 mt-4 pt-4 flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gradient">
                    {getTotalAmount().toLocaleString()} CDF
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                >
                  <FaArrowLeft /> Retour
                </button>
                <button
                  onClick={handleContinue}
                  disabled={
                    !selectedPayment ||
                    !customerInfo.name ||
                    !customerInfo.phone ||
                    processing
                  }
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />} {processing ? "Traitement..." : "Valider"}
                </button>
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => setStep(4)}
                  className="text-zinc-400 hover:text-red-500 transition-colors text-sm underline"
                >
                  J'ai déjà un token pour cette commande
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="card-glass text-center animate-slide-up">
              <div className="text-6xl mb-6 text-red-500 flex justify-center">
                <FaMobileAlt />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Demande enregistrée !
              </h2>

              <div className="bg-zinc-800/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto border border-zinc-700">
                <p className="text-xl text-white mb-4">
                  Pour finaliser votre achat, veuillez effectuer le paiement :
                </p>
                <div className="text-xl font-bold text-red-500 mb-4 p-6 bg-black rounded-lg border border-red-500/30 flex flex-col gap-3 text-left">
                  {
                    paymentMethods.find((m) => m.id === selectedPayment)
                      ?.instructions.map((line, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-red-600/50">{idx + 1}.</span>
                          <span>{line.replace('[NUMERO]', ' [Numéro de l\'artiste]').replace('[MONTANT]', ` ${getTotalAmount().toLocaleString()}`)}</span>
                        </div>
                      ))
                  }
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Une fois le paiement effectué, vous recevrez votre{" "}
                  <span className="text-white font-bold">token unique</span>{" "}
                  dans les 12h qui suivent pour télécharger votre billet.
                </p>
                <p className="text-zinc-400 text-sm mt-4">
                  💡 Revenez sur cette page avec votre token pour télécharger
                  votre billet !
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events" className="btn btn-primary">
                  Retour aux spectacles
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
