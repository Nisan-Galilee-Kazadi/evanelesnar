import { Link, useLocation } from "react-router-dom";
import logo from "../images/logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Ne rien afficher pour les pages d'administration
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const socialLinks = [
    { name: "Facebook", icon: <FaFacebookF />, url: "https://www.facebook.com/people/Evane-Lesnar/100081707015576/#" },
    { name: "Instagram", icon: <FaInstagram />, url: "https://www.instagram.com/evanelesnar/?__d=dist" },
    { name: "TikTok", icon: <FaTiktok />, url: "https://www.tiktok.com/@evanelesnar/photo/7579940946217880844" },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      url: "https://wa.me/243000000000",
    },
  ];

  const quickLinks = [
    { name: "Accueil", path: "/" },
    { name: "À Propos", path: "/about" },
    { name: "Spectacles", path: "/events" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center overflow-hidden p-0.5">
                <img src={logo} alt="Logo" className="w-full h-full object-contain contrast-125 brightness-90 saturate-150 drop-shadow-sm" />
              </div>
              <h3 className="text-2xl font-bold text-gradient transition-all duration-300 group-hover:scale-110 group-hover:tracking-wider">
                Evan Lesnar
              </h3>
            </div>
            <p className="text-slate-400 mb-4">
              Humoriste professionnel basé en RDC. Spectacles, stand-up et
              événements privés.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  title={social.name}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Liens Rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-red-500 transition-colors duration-300 flex items-center"
                  >
                    <span className="mr-2">›</span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center space-x-3">
                <span className="text-red-500">
                  <FaEnvelope />
                </span>
                <a
                  href="mailto:evanebukasa@gmail.com"
                  className="hover:text-red-500 transition-colors"
                >
                  evanebukasa@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-red-500 transform -scale-x-100">
                  <FaPhone />
                </span>
                <a
                  href="tel:+243 89 446 1721"
                  className="hover:text-red-500 transition-colors"
                >
                  +243 89 446 1721
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-red-500">
                  <FaMapMarkerAlt />
                </span>
                <span>Kinshasa, RDC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-slate-500 text-sm">
            © {currentYear} Evan Lesnar. Tous droits réservés.
          </p>
          <div className="flex space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-red-500 transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
