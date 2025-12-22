import { Link } from "react-router-dom";
import { artistInfo } from "../data/mockData";
import { useState, useEffect } from "react";
import { API } from "../utils/api";
import heroImage from "../images/heroimage.jpg";
import {
  FaTicketAlt,
  FaMask,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaFire,
  FaPlay,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoId: null,
  });

  const [sloganIndex, setSloganIndex] = useState(0);
  const slogans = [
    '"Donc Cest le foufou que tu manges..."',
    '"Une bouche de moins... en vaut plus."',
  ];

  const [homeMedia, setHomeMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(API("/api/events?upcoming=true"));
        const data = await response.json();
        setEvents(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchHomeMedia = async () => {
      try {
        const res = await fetch(API("/api/media?destination=home"));
        const data = await res.json();
        setHomeMedia(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };

    fetchHomeMedia();
  }, []);

  const openVideo = (videoId) => {
    setVideoModal({ isOpen: true, videoId });
  };

  const closeVideo = () => {
    setVideoModal({ isOpen: false, videoId: null });
  };

  const closeMediaDetails = () => {
    setSelectedMedia(null);
  };

  const toYoutubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
    );
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
  };

  const nextSlide = () => {
    if (!events.length) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    if (!events.length) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  const getVisibleEvents = (count) => {
    if (!events.length) return [];
    return Array.from({ length: count }, (_, i) => events[(currentIndex + i) % events.length]);
  };

  const visibleEvents = getVisibleEvents(3);

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div className="min-h-screen">
      {videoModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
            >
              <FaTimes className="text-3xl" />
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeMediaDetails}
        >
          <div
            className="relative w-full max-w-3xl bg-black border border-gray-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeMediaDetails}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>

            <div className="bg-black">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title || "media"}
                  className="w-full max-h-[420px] object-cover"
                />
              ) : (
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={toYoutubeEmbed(selectedMedia.url) || selectedMedia.url}
                    title={selectedMedia.title || "Media"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedMedia.title || (selectedMedia.type === "video" ? "Vidéo" : "Photo")}
              </h3>
              <p className="text-slate-400 mb-4 whitespace-pre-line">
                {selectedMedia.description || ""}
              </p>

              {selectedMedia.sourceEvent && (
                <div className="bg-black border border-gray-800 rounded-xl p-4">
                  <div className="text-white font-semibold mb-2">Événement lié</div>
                  <div className="text-slate-400 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-red-500" />
                      <span>
                        {new Date(selectedMedia.sourceEvent.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-red-500" />
                      <span>{selectedMedia.sourceEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span>
                        {selectedMedia.sourceEvent.venue}, {selectedMedia.sourceEvent.city}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 md:hidden">
          <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 container-custom pt-64 md:pt-28 pb-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="hidden md:block">
              <div className="relative rounded-3xl overflow-hidden bg-black">
                <img src={heroImage} alt="Hero" className="w-full h-[640px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/20" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-red-600/25 blur-3xl" />
              </div>
            </div>

            <div className="text-center md:text-left">

              <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="text-white">Evane</span>{" "}
                <span className="text-red-500">Lesnar</span>
              </h1>

              <p className="mt-8 text-[16px] md:text-2xl text-slate-200 italic min-h-[3.5rem]">
                {slogans[sloganIndex]}
              </p>
{/* 
              <p className="mt-6 text-slate-300 max-w-2xl md:max-w-none">
                Préparez-vous à rire aux éclats !
              </p> */}

              <div className="mt-12 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <Link
                  to="/events"
                  className="btn bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  <span>Réserver un billet</span>
                  <FaTicketAlt className="text-3xl" />
                </Link>
                <a
                  href="/about"
                  className="btn bg-transparent border border-slate-700 text-white hover:border-red-500 text-lg px-8 py-4 w-full sm:w-auto"
                >
                  En savoir plus
                </a>
              </div>

              <div className="hidden md:grid mt-12 grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">2022</div>
                  <div className="text-slate-400 text-sm">Début</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">~4 ans</div>
                  <div className="text-slate-400 text-sm">Expérience</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">2024</div>
                  <div className="text-slate-400 text-sm">Prix Prexelart</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">Rodage</div>
                  <div className="text-slate-400 text-sm">1er spectacle</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION - MOBILE ONLY */}
      <section className="md:hidden bg-black py-8 border-t border-b border-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div className="bg-black border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">2022</div>
              <div className="text-xs text-gray-400 mt-1">Début</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-black border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">+3 ans</div>
              <div className="text-xs text-gray-400 mt-1">Expérience</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-black border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">2024</div>
              <div className="text-xs text-gray-400 mt-1">Prix Prexelart</div>
            </div>

            {/* Stat 4 */}
            <div className="bg-black border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">Rodage</div>
              <div className="text-xs text-gray-400 mt-1">1er spectacle</div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section bg-black">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Prochains Spectacles</h2>
            <p className="text-slate-400 text-lg mt-4">
              Ne manquez pas mes prochaines dates !
            </p>
          </div>

          {events.length > 0 ? (
            <>
              <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                >
                  <FaChevronLeft />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                >
                  <FaChevronRight />
                </button>

                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleEvents.map((event, index) => (
                    <div
                      key={event._id}
                      className="event-card animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

                        {event.status === "selling-fast" && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                            <FaFire /> Vente rapide
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-3 text-white">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-slate-400">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-500">
                              <FaCalendarAlt />
                            </span>
                            <span>
                              {new Date(event.date).toLocaleDateString(
                                "fr-FR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
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

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-sm text-slate-500">
                              À partir de
                            </span>
                            <div className="text-2xl font-bold text-gradient">
                              {event.tickets[0].price.toLocaleString()}{" "}
                              {event.tickets[0].currency}
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/events/${event._id}`}
                          className="btn btn-primary w-full text-center"
                        >
                          Réserver maintenant
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="md:hidden">
                  {getVisibleEvents(1).map((event) => (
                    <div key={event._id} className="event-card animate-slide-up">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

                        {event.status === "selling-fast" && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                            <FaFire /> Vente rapide
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-3 text-white">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-slate-400">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-500">
                              <FaCalendarAlt />
                            </span>
                            <span>
                              {new Date(event.date).toLocaleDateString(
                                "fr-FR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
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

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-sm text-slate-500">
                              À partir de
                            </span>
                            <div className="text-2xl font-bold text-gradient">
                              {event.tickets[0].price.toLocaleString()} {event.tickets[0].currency}
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/events/${event._id}`}
                          className="btn btn-primary w-full text-center"
                        >
                          Réserver maintenant
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-12">
                <Link to="/events" className="btn btn-outline text-lg">
                  Voir tous les spectacles
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-12">
              Chargement des événements...
            </div>
          )}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="section bg-gradient-to-br from-red-900/10 to-black">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Extraits de Spectacles</h2>
            <p className="text-slate-400 text-lg mt-4">
              Découvrez quelques moments cultes !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {homeMedia.map((m) => (
              <div
                key={m._id}
                className="card group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={m.type === "video" ? m.thumbnail : m.url}
                    alt={m.title || "media"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {m.type === "video" && (
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all cursor-pointer"
                      onClick={() => openVideo(toYoutubeEmbed(m.url)?.split("/").pop() || m.url)}
                    >
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <span className="text-3xl text-white pl-1">
                          <FaPlay />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {m.title || (m.type === "video" ? "Vidéo" : "Photo")}
                </h3>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-400 text-sm line-clamp-1">
                    {m.description || ""}
                  </p>
                  <button
                    className="text-sm px-4 py-2 bg-black border border-gray-800 text-white rounded-lg hover:border-red-500 transition-colors"
                    onClick={() => setSelectedMedia(m)}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-red-700 to-red-900">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à vivre une soirée inoubliable ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Réservez vos billets maintenant et payez facilement !
          </p>
          <Link
            to="/events"
            className="btn bg-white text-red-700 hover:bg-slate-100 text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            <span>Réserver mes billets</span>{" "}
            <FaTicketAlt className="text-3xl" />
          </Link>
        </div>
      </section>

    </div >
  );
};

export default Home;
