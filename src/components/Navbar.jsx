import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/logo.png";
import {
  FaTicketAlt,
  FaMask,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "À Propos", path: "/about" },
    { name: "Spectacles", path: "/events" },
    { name: "Galerie", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: <FaFacebookF />, url: "https://www.facebook.com/people/Evane-Lesnar/100081707015576/#" },
    { name: "Instagram", icon: <FaInstagram />, url: "https://www.instagram.com/evanelesnar/?__d=dist" },
    { name: "TikTok", icon: <FaTiktok />, url: "https://www.tiktok.com/@evanelesnar/photo/7579940946217880844" },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      url: "https://wa.me/243894461721",
    },
  ];

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-black/90 backdrop-blur-md py-4 shadow-2xl border-b border-red-900/40"
        : "bg-transparent py-6 border-b border-transparent"
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-red-600/20 overflow-hidden p-0.5">
              <img src={logo} alt="Logo" className="w-full h-full object-contain contrast-125 brightness-90 saturate-150 drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white transition-all duration-300 group-hover:scale-110 group-hover:tracking-wider">
                Evan Lesnar
              </h1>
              <p className="text-xs text-red-500 font-medium tracking-wider">
                HUMORISTE
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 group ${location.pathname === link.path
                  ? "text-red-500"
                  : "text-slate-300 hover:text-red-500"
                  }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-900 transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? "w-full" : ""
                    }`}
                ></span>
              </Link>
            ))}
            <Link
              to="/events"
              className="btn btn-primary text-sm flex items-center space-x-2"
            >
              <span>Réserver</span>
              <FaTicketAlt />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 group z-50 relative"
          >
            <span
              className={`w-6 h-0.5 bg-red-500 transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-red-500 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-red-500 transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full bg-black border-b border-slate-800 shadow-2xl p-6 pt-24 animate-slide-down">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg transition-colors duration-300 ${location.pathname === link.path
                    ? "bg-red-500/10 text-red-500 border-l-4 border-red-500"
                    : "text-slate-300 hover:bg-black"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-primary w-full text-center flex items-center justify-center space-x-2 mt-4"
              >
                <span>Réserver</span>
                <FaTicketAlt />
              </Link>
            </div>

            {/* Mobile Social Links */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-slate-500 text-sm mb-4 text-center">
                Suivez-moi
              </p>
              <div className="flex justify-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-black text-slate-400 hover:text-white hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
