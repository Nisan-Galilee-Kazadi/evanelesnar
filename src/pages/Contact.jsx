import { useState } from 'react';
import {
    FaEnvelope,
    FaPhoneAlt,
    FaWhatsapp,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaPaperPlane,
    FaFacebookF,
    FaInstagram,
    FaTiktok,
} from 'react-icons/fa';
import { API } from '../utils/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API('/api/contact'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                }, 5000);
            } else {
                setError(data.message || 'Une erreur est survenue');
            }
        } catch (err) {
            console.error('Error sending contact form:', err);
            setError('Impossible d\'envoyer le message. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const contactInfo = [
        {
            icon: <FaEnvelope />,
            title: 'Email',
            value: 'evanebukasa@gmail.com',
            link: 'mailto:evanebukasa@gmail.com'
        },
        {
            icon: <FaPhoneAlt />,
            title: 'Téléphone',
            value: '+243 89 446 1721',
            link: 'tel:+243 89 446 1721'
        },
        {
            icon: <FaWhatsapp />,
            title: 'WhatsApp',
            value: 'Envoyer un message',
            link: 'https://wa.me/243000000000'
        },
        {
            icon: <FaMapMarkerAlt />,
            title: 'Localisation',
            value: 'Kinshasa, RDC',
            link: '#'
        }
    ];

    const socialLinks = [
        { name: 'Facebook', icon: <FaFacebookF />, url: 'https://www.facebook.com/people/Evane-Lesnar/100081707015576/#', color: 'hover:bg-red-600' },
        { name: 'Instagram', icon: <FaInstagram />, url: 'https://www.instagram.com/evanelesnar/?__d=dist', color: 'hover:bg-red-700' },
        { name: 'TikTok', icon: <FaTiktok />, url: 'https://www.tiktok.com/@evanelesnar/photo/7579940946217880844', color: 'hover:bg-slate-800' },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="section-title mb-4">Contactez-moi</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Une question ? Une demande de booking ? N'hésitez pas à me contacter !
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <div className="card-glass">
                        <h2 className="text-2xl font-bold text-white mb-6">Envoyez-moi un message</h2>

                        {submitted ? (
                            <div className="text-center py-12 animate-slide-up">
                                <div className="text-6xl mb-4 text-green-500 flex justify-center"><FaCheckCircle /></div>
                                <h3 className="text-2xl font-bold text-white mb-2">Message envoyé !</h3>
                                <p className="text-slate-400">Je vous répondrai dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Nom complet *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-red-900/0 border border-red-900/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                            placeholder="Votre nom"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-red-900/0 border border-red-900/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                            placeholder="votre@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Téléphone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-red-900/0 border border-red-900/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                            placeholder="+243 000 000 000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Sujet *</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-black border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="booking">Demande de booking</option>
                                            <option value="collaboration">Collaboration</option>
                                            <option value="media">Demande média</option>
                                            <option value="support">Support billetterie</option>
                                            <option value="other">Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2 text-sm">Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full px-4 py-3 bg-red-900/0 border border-red-900/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                                            placeholder="Votre message..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Envoi en cours...' : 'Envoyer le message'} <FaPaperPlane />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* Contact Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {contactInfo.map((info, idx) => (
                                <a
                                    key={idx}
                                    href={info.link}
                                    className="card group hover:border-red-500 transition-all"
                                >
                                    <div className="text-4xl mb-3 text-red-500 ">{info.icon}</div>
                                    <h3 className="text-white font-bold mb-1">{info.title}</h3>
                                    <p className="text-slate-400 text-sm group-hover:text-red-400 transition-colors">
                                        {info.value}
                                    </p>
                                </a>
                            ))}
                        </div>

                        {/* Social Media */}
                        <div className="card-glass">
                            <h3 className="text-xl font-bold text-white mb-4">Suivez-moi</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-2 px-4 py-2 bg-red-900 rounded-lg transition-all transform hover:scale-105 ${social.color}`}
                                    >
                                        <span className="text-2xl text-white">{social.icon}</span>
                                        <span className="text-white font-medium">{social.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="card-glass">
                            <h3 className="text-xl font-bold text-white mb-4">Disponibilité</h3>
                            <div className="space-y-2 text-slate-400">
                                <div className="flex justify-between">
                                    <span>Lundi - Vendredi</span>
                                    <span className="text-white">9h - 18h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Samedi</span>
                                    <span className="text-white">10h - 16h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dimanche</span>
                                    <span className="text-red-400">Fermé</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking CTA */}
                        <div className="card bg-gradient-to-br from-red-700 to-red-900 border-none">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Booking professionnel
                            </h3>
                            <p className="text-white/90 mb-4">
                                Pour les demandes de spectacles privés ou événements d'entreprise
                            </p>
                            <a href="mailto:evanebukasa@gmail.com" className="btn bg-white text-red-700 hover:bg-slate-100 w-full">
                                Demande de booking
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
