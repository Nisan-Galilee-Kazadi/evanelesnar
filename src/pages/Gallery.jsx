import { useEffect, useMemo, useState } from 'react';
import { API } from '../utils/api';
import { FaPlay, FaTimes, FaCamera, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Gallery = () => {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const categories = [
    { id: 'all', name: 'Tout' },
    { id: 'performance', name: 'Spectacles' },
    { id: 'backstage', name: 'Coulisses' },
    { id: 'events', name: 'Événements' },
    { id: 'video', name: 'Vidéos' },
  ];

  useEffect(() => {
    const fetchGalleryMedia = async () => {
      try {
        const res = await fetch(API('/api/media?destination=gallery'));
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching gallery media:', e);
      }
    };

    fetchGalleryMedia();
  }, []);

  const filteredGallery = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  const toYoutubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title mb-4">Galerie</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Découvrez les moments forts de mes spectacles et événements
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item, idx) => (
            <div
              key={item._id}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.title || 'media'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={item.thumbnail}
                    alt={item.title || 'video'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <span className="text-3xl text-white pl-1"><FaPlay /></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 w-full">
                  <h3 className="text-white font-bold text-lg mb-1">{item.title || (item.type === 'video' ? 'Vidéo' : 'Photo')}</h3>
                  <p className="text-red-400 text-sm capitalize">{item.category}</p>
                  <button
                    className="mt-3 w-full bg-black/60 hover:bg-black text-white text-sm py-2 rounded-lg border border-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMedia(item);
                    }}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-slide-up"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center text-2xl transition-colors"
              onClick={() => setSelectedMedia(null)}
            >
              <span className="text-white"><FaTimes /></span>
            </button>
            <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-black">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title || 'media'}
                      className="w-full max-h-[520px] object-cover"
                    />
                  ) : (
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={toYoutubeEmbed(selectedMedia.url) || selectedMedia.url}
                        title={selectedMedia.title || 'Media'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="text-center">
                    <h3 className="text-white text-2xl font-bold mb-2">
                      {selectedMedia.title || (selectedMedia.type === 'video' ? 'Vidéo' : 'Photo')}
                    </h3>
                    <p className="text-red-400 capitalize">{selectedMedia.category}</p>
                  </div>

                  {selectedMedia.description && (
                    <p className="text-zinc-300 mt-6 whitespace-pre-line">
                      {selectedMedia.description}
                    </p>
                  )}

                  {selectedMedia.sourceEvent && (
                    <div className="mt-6 bg-black border border-gray-800 rounded-xl p-4">
                      <div className="text-white font-semibold mb-2">Événement lié</div>
                      <div className="text-zinc-400 text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-red-500" />
                          <span>
                            {new Date(selectedMedia.sourceEvent.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-red-500" />
                          <span>{selectedMedia.sourceEvent.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-red-500" />
                          <span>{selectedMedia.sourceEvent.venue}, {selectedMedia.sourceEvent.city}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredGallery.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 text-zinc-600 flex justify-center"><FaCamera /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun média trouvé</h3>
            <p className="text-zinc-400">
              Essayez une autre catégorie
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
