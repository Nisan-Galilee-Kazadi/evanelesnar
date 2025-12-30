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
  FaVideo,
} from "react-icons/fa";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [showDetails, setShowDetails] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(API("/api/events?upcoming=true"));
        const data = await response.json();
        setEvents(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeMediaDetails}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Fixed top right */}
            <button
              onClick={closeMediaDetails}
              className="fixed top-6 right-6 z-50 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-2xl"
            >
              <FaTimes className="text-2xl" />
            </button>

            {/* Video/Image Container - Centered */}
            <div className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url.replace("http://", "https://")}
                  alt={selectedMedia.title || "media"}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  crossOrigin="anonymous"
                />
              ) : (
                <video
                  src={selectedMedia.url.replace("http://", "https://")}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  crossOrigin="anonymous"
                  controlsList="nodownload"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              )}
            </div>

            {/* Details Toggle Button - Bottom Center */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-xl border border-white/20"
            >
              <FaFire className="text-red-500" />
              <span>{showDetails ? "Masquer" : "Voir"} les détails</span>
            </button>

            {/* Details Panel - Slide from bottom */}
            {showDetails && (
              <div
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent p-6 pb-20 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedMedia.title || (selectedMedia.type === "video" ? "Vidéo" : "Photo")}
                  </h3>
                  <p className="text-zinc-300 mb-4 whitespace-pre-line">
                    {selectedMedia.description || ""}
                  </p>

                  {selectedMedia.sourceEvent && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <div className="text-white font-semibold mb-2">Événement lié</div>
                      <div className="text-zinc-300 text-sm space-y-2">
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
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-black" data-aos="fade-in">
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

              <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight" data-aos="fade-up" data-aos-delay="200">
                <span className="text-white">Evane</span>{" "}
                <span className="text-red-500">Lesnar</span>
              </h1>

              <p className="mt-8 text-[16px] md:text-2xl text-zinc-200 italic min-h-[3.5rem]" data-aos="fade-up" data-aos-delay="300">
                {slogans[sloganIndex]}
              </p>
              {/* 
              <p className="mt-6 text-zinc-300 max-w-2xl md:max-w-none">
                Préparez-vous à rire aux éclats !
              </p> */}

              <div className="mt-12 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4" data-aos="fade-up" data-aos-delay="400">
                <Link
                  to="/events"
                  className="btn bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  <span>Réserver un billet</span>
                  <FaTicketAlt className="text-3xl" />
                </Link>
                <a
                  href="/about"
                  className="btn bg-transparent border border-zinc-700 text-white hover:border-red-500 text-lg px-8 py-4 w-full sm:w-auto"
                >
                  En savoir plus
                </a>
              </div>

              <div className="hidden md:grid mt-12 grid-cols-2 lg:grid-cols-4 gap-4" data-aos="fade-up" data-aos-delay="500">
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">2022</div>
                  <div className="text-zinc-400 text-sm">Début</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">+3 ans</div>
                  <div className="text-zinc-400 text-sm">Expérience</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">2024</div>
                  <div className="text-zinc-400 text-sm">Prix Prexelart</div>
                </div>
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">Rodage</div>
                  <div className="text-zinc-400 text-sm">1er spectacle</div>
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
      <section className="section bg-black" data-aos="fade-up">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Prochains Spectacles</h2>
            <p className="text-zinc-400 text-lg mt-4">
              Ne manquez pas mes prochaines dates !
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400 text-lg">Chargement des spectacles...</p>
            </div>
          ) : events.length > 0 ? (
            <>
              <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {events.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full items-center justify-center text-white shadow-lg transition-all"
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      onClick={nextSlide}
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full items-center justify-center text-white shadow-lg transition-all"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                <div className={`hidden md:grid grid-cols-1 ${events.length === 1 ? 'md:grid-cols-1' : events.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3 px-1`} data-aos="zoom-in">
                  {(events.length <= 3 ? events : visibleEvents).map((event, index) => (
                    <div
                      key={event._id}
                      className={`event-card animate-slide-up border-2 border-red-800/50 rounded-lg overflow-hidden hover:border-red-600 transition-colors duration-300 m-1 ${events.length === 1 ? 'max-w-2xl mx-auto' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-aos="fade-up"
                      data-aos-delay={`${index * 100}`}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>

                        {event.status === "selling-fast" && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                            <FaFire /> Vente rapide
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-2xl font-bold mb-3 text-white">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-zinc-400">
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

                        <p className="text-zinc-400 mb-6 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-sm text-zinc-500">
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
                    <div key={event._id} className="event-card animate-slide-up border-2 border-red-800/50 rounded-lg overflow-hidden hover:border-red-600 transition-colors duration-300 mx-2">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>

                        {event.status === "selling-fast" && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                            <FaFire /> Vente rapide
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-2xl font-bold mb-3 text-white">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-zinc-400">
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

                        <p className="text-zinc-400 mb-6 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-sm text-zinc-500">
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
            <div className="text-center text-zinc-400 py-12">
              Chargement des événements...
            </div>
          )}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="section bg-gradient-to-br from-red-900/10 to-black" data-aos="fade-up">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Extraits de Spectacles</h2>
            <p className="text-slate-400 text-lg mt-4">
              Découvrez quelques moments cultes !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" data-aos="zoom-in">
            {homeMedia.map((m) => (
              <div
                key={m._id}
                className="card group"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-black">
                  {m.type === "video" ? (
                    <div className="relative w-full h-full group/video">
                      <video
                        src={m.url.replace("http://", "https://")}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        crossOrigin="anonymous"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center cursor-pointer group-hover/video:bg-black/60 transition-all"
                        onClick={() => setSelectedMedia(m)}
                      >
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform group-hover/video:scale-110 transition-transform shadow-2xl">
                          <FaPlay className="text-3xl text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                        <FaVideo className="text-red-500" />
                        <span>Vidéo</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={m.url.replace("http://", "https://")}
                      alt={m.title || "media"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      crossOrigin="anonymous"
                    />
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
      <section className="section bg-gradient-to-r from-red-700 to-red-900" data-aos="fade-up">
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
