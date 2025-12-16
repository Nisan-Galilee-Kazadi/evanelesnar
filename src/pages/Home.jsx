import { Link } from "react-router-dom";
import { artistInfo } from "../data/mockData";
import { useState, useEffect } from "react";
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

  const videos = [
    {
      id: 1,
      title: "Best Of 2024",
      views: "2.5M vues",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      id: 2,
      title: "Sketch Viral",
      views: "1.8M vues",
      youtubeId: "dQw4w9WgXcQ",
    },
  ];

  const openVideo = (videoId) => {
    setVideoModal({ isOpen: true, videoId });
  };

  const closeVideo = () => {
    setVideoModal({ isOpen: false, videoId: null });
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + events.length) % events.length
    );
  };

  const visibleEvents = events.slice(currentIndex, currentIndex + 3);

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
              className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors"
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

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="hero-overlay"></div>
        </div>

        <div className="relative z-10 container-custom text-center px-4 pt-32">
          <div className="animate-slide-up">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-400 text-sm font-semibold backdrop-blur-sm flex items-center gap-2">
                <FaMask /> Humoriste Professionnel
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white">Evan</span>{" "}
              <span className="text-gradient animate-glow">Lesnar</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-tight italic">
              {artistInfo.tagline}
            </p>

            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Préparez-vous à rire aux éclats !
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Réserver un billet</span>{" "}
                <FaTicketAlt className="text-3xl" />
              </Link>
              <Link
                to="/about"
                className="btn btn-outline text-lg px-8 py-4 w-full sm:w-auto"
              >
                En savoir plus
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              <div className="card-glass text-center">
                <div className="text-4xl font-bold text-gradient mb-2">
                  {artistInfo.stats.shows}
                </div>
                <div className="text-slate-400 text-sm">Spectacles</div>
              </div>
              <div className="card-glass text-center">
                <div className="text-4xl font-bold text-gradient mb-2">
                  {artistInfo.stats.fans}
                </div>
                <div className="text-slate-400 text-sm">Fans</div>
              </div>
              <div className="card-glass text-center">
                <div className="text-4xl font-bold text-gradient mb-2">
                  {artistInfo.stats.years}
                </div>
                <div className="text-slate-400 text-sm">
                  Années d'expérience
                </div>
              </div>
              <div className="card-glass text-center">
                <div className="text-4xl font-bold text-gradient mb-2">
                  {artistInfo.stats.awards}
                </div>
                <div className="text-slate-400 text-sm">Prix remportés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section bg-slate-950">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Prochains Spectacles</h2>
            <p className="text-slate-400 text-lg mt-4">
              Ne manquez pas mes prochaines dates !
            </p>
          </div>

          {events.length > 0 ? (
            <>
              <div className="relative">
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                >
                  <FaChevronLeft />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                >
                  <FaChevronRight />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <span className="text-orange-500">
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
                            <span className="text-orange-500">
                              <FaClock />
                            </span>
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-orange-500">
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
      <section className="section bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Extraits de Spectacles</h2>
            <p className="text-slate-400 text-lg mt-4">
              Découvrez quelques moments cultes !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {videos.map((video) => (
              <div
                key={video.id}
                className="card group cursor-pointer"
                onClick={() => openVideo(video.youtubeId)}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={`https://images.unsplash.com/photo-${
                      video.id === 1 ? "1598387181032" : "1516450360452"
                    }-a3103a2db5b3?w=800&h=450&fit=crop`}
                    alt={`Vidéo ${video.id}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <span className="text-3xl text-white pl-1">
                        <FaPlay />
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {video.title}
                </h3>
                <p className="text-slate-400">{video.views}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à vivre une soirée inoubliable ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Réservez vos billets maintenant et payez facilement !
          </p>
          <Link
            to="/events"
            className="btn bg-white text-orange-600 hover:bg-slate-100 text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            <span>Réserver mes billets</span>{" "}
            <FaTicketAlt className="text-3xl" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
