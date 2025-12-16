import { artistInfo } from '../data/mockData';
import { FaMask, FaTrophy, FaTicketAlt } from 'react-icons/fa';

const About = () => {
    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container-custom">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    {/* Image */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden h-96 lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop"
                                alt="Evan Lesnar"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-4xl md:text-6xl animate-float">
                            <span className="text-white"><FaMask /></span>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <div className="inline-block mb-4">
                            <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-400 text-sm font-semibold">
                                À Propos
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            {artistInfo.name}
                        </h1>
                        <p className="text-2xl text-gradient mb-8">{artistInfo.tagline}</p>

                        <div className="prose prose-invert max-w-none">
                            {artistInfo.bio.split('\n\n').map((paragraph, idx) => (
                                <p key={idx} className="text-slate-300 text-lg leading-relaxed mb-4">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    <div className="card-glass text-center">
                        <div className="text-5xl font-bold text-gradient mb-2">{artistInfo.stats.shows}</div>
                        <div className="text-slate-400">Spectacles donnés</div>
                    </div>
                    <div className="card-glass text-center">
                        <div className="text-5xl font-bold text-gradient mb-2">{artistInfo.stats.fans}</div>
                        <div className="text-slate-400">Fans</div>
                    </div>
                    <div className="card-glass text-center">
                        <div className="text-5xl font-bold text-gradient mb-2">{artistInfo.stats.years}</div>
                        <div className="text-slate-400">Années d'expérience</div>
                    </div>
                    <div className="card-glass text-center">
                        <div className="text-5xl font-bold text-gradient mb-2">{artistInfo.stats.awards}</div>
                        <div className="text-slate-400">Prix remportés</div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                        Réalisations & Prix
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {artistInfo.achievements.map((achievement, idx) => (
                            <div key={idx} className="card flex items-center space-x-4 group hover:border-orange-500">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 transform group-hover:rotate-12 transition-transform">
                                    <span className="text-2xl text-white"><FaTrophy /></span>
                                </div>
                                <p className="text-slate-300 font-medium">{achievement}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <div className="card-glass max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Envie de rire ?
                        </h3>
                        <p className="text-slate-400 mb-6">
                            Découvrez mes prochains spectacles et réservez vos places dès maintenant
                        </p>
                        <a href="/events" className="btn btn-primary text-lg flex items-center justify-center gap-2 w-fit mx-auto">
                            Voir les spectacles <FaTicketAlt className="text-3xl" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
