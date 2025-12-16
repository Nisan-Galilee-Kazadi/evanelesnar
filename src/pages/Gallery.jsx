import { useState } from 'react';
import { galleryData } from '../data/mockData';
import { FaPlay, FaTimes, FaCamera } from 'react-icons/fa';

const Gallery = () => {
    const [filter, setFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);

    const categories = [
        { id: 'all', name: 'Tout' },
        { id: 'performance', name: 'Spectacles' },
        { id: 'backstage', name: 'Coulisses' },
        { id: 'events', name: 'Événements' },
        { id: 'video', name: 'Vidéos' },
    ];

    const filteredGallery = filter === 'all'
        ? galleryData
        : galleryData.filter(item => item.category === filter);

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title mb-4">Galerie</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
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
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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
                            key={item.id}
                            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer animate-slide-up"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                            onClick={() => item.type === 'image' && setSelectedImage(item)}
                        >
                            {item.type === 'image' ? (
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="relative w-full h-full">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
                                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                            <span className="text-3xl text-white pl-1"><FaPlay /></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                <div className="p-6 w-full">
                                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="text-orange-400 text-sm capitalize">{item.category}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-slide-up"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 w-12 h-12 bg-slate-800 hover:bg-orange-500 rounded-full flex items-center justify-center text-2xl transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <span className="text-white"><FaTimes /></span>
                        </button>
                        <div className="max-w-5xl max-h-full">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="text-center mt-6">
                                <h3 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h3>
                                <p className="text-orange-400 capitalize">{selectedImage.category}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredGallery.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4 text-slate-600 flex justify-center"><FaCamera /></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Aucun média trouvé</h3>
                        <p className="text-slate-400">
                            Essayez une autre catégorie
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
