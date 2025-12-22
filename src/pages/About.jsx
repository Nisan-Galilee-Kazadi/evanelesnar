import aboutImage from "../images/about.jpg";
import logo from "../images/logo.png";
import kisabakaImg from "../images/Émission kisabaka s’occupe de vous.JPG";
import dojoImg from "../images/Dojo comedy club au jungle bar.JPG";
import canalImg from "../images/IMG_2616.JPG";
import marathonImg from "../images/3ème soirée du Marathon du rire by illicocash au chacha bar.JPG";
import sekaImg from "../images/Première soirée du seka club.JPG";
import rodageImg from "../images/Rodage.PNG";
import { useState } from "react";
import { FaMask, FaTimes, FaTicketAlt } from "react-icons/fa";

const About = () => {
  const [selectedParcours, setSelectedParcours] = useState(null);

  const closeParcoursDetails = () => {
    setSelectedParcours(null);
  };

  const parcours = [
    {
      year: "2022",
      title: "Débuts – Kisabaka s’occupe de vous",
      image: kisabakaImg,
      details:
        "Formé via les ateliers de Félix Kisabaka (« Kisabaka s’occupe de vous »).\n\nPremiers pas et apprentissages structurants.",
    },
    {
      year: "2023",
      title: "Le Dojo d’Humour – Benji4",
      image: dojoImg,
      details:
        "Intégration du Dojo d’Humour (Benji4).\n\nUn tremplin qui accélère la progression et la visibilité.",
    },
    {
      year: "2024",
      title: "Canal+ Comedy Club (avec Herman Amisi)",
      image: canalImg,
      details: "Participation remarquée au Canal+ Comedy Club aux côtés d’Herman Amisi.",
    },
    {
      year: "2024",
      title: "Marathon du Rire by Illicocash / Pool Malebo Stand-Up",
      image: marathonImg,
      details:
        "Passages au Pool Malebo Stand-Up et au Marathon du Rire by Illicocash.\n\nScène partagée avec Michel Gohou.",
    },
    {
      year: "Aujourd’hui",
      title: "Membre du Seka Club",
      image: sekaImg,
      details:
        "Collaboration avec Bob, Tonton Cado, Tresor Fall, Youssef Meta, Juvenal Yombo.\n\nUn collectif actif et exigeant.",
    },
    {
      year: "2025",
      title: "Rodage – premier spectacle",
      image: rodageImg,
      details:
        "Rodage (13 septembre 2025 – Silas Bar, Kintambo).\n\nAmbition : conquérir les grandes scènes internationales avec un humour moderne et authentique.",
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      {selectedParcours && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeParcoursDetails}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeParcoursDetails}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-black">
                <img
                  src={selectedParcours.image}
                  alt={selectedParcours.title}
                  className="w-full h-full max-h-[520px] object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-red-500 text-sm font-semibold mb-2">
                  {selectedParcours.year}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {selectedParcours.title}
                </h3>
                <p className="text-slate-300 whitespace-pre-line">{selectedParcours.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden h-96 md:h-[800px]">
              <img src={aboutImage} alt="Evane Lesnar" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center animate-float overflow-hidden p-1">
              <img src={logo} alt="Logo" className="w-full h-full object-contain contrast-125 brightness-90 saturate-150 drop-shadow-sm" />
            </div>
          </div>

          <div>
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-red-600/15 border border-red-600/40 rounded-full text-red-300 text-sm font-semibold">
                À Propos
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Evane Lesnar Bukasa
            </h1>

            <div className="prose prose-invert max-w-none">
              {[
                "Evane Lesnar Bukasa fait ses premiers pas dans l’humour en 2022 au sein de l’émission « Kisabaka s’occupe de vous » de Félix Kisabaka, où il se forme à travers divers ateliers spécialisés. En 2023, il franchit une étape décisive en intégrant Le Dojo d’Humour, plateforme dirigée par Benji4, véritable tremplin qui le propulse comme l’une des pépites montantes de l’humour congolais.",
                "Depuis, il enchaîne les scènes prestigieuses et les expériences marquantes : une participation remarquée au Canal+ Comedy Club aux côtés d’Herman Amisi, les premières parties de Benji4, ainsi que des passages au Pool Malebo Stand-Up et au Marathon du Rire by Illicocash, où il partage l’affiche avec des icônes comme Gohou Michel. Aujourd’hui membre actif du Seka Club, il collabore avec des talents tels que Bob, Tonton Cado et Tresor Fall.",
                "Son univers artistique repose sur l’autodérision, une arme comique qu’il manie avec justesse pour transformer sa réalité en éclats de rire. Son talent a été officiellement couronné en 2024 par le prix du Meilleur Jeune Humoriste au Prexelart (Prix de l’Excellence Artistique).",
                "En 2025, avec le rodage de son premier spectacle, Evane Lesnar affirme son identité et son ambition : conquérir les grandes scènes internationales avec un humour authentique, moderne et résolument proche de son public.",
              ].map((paragraph, idx) => (
                <p key={idx} className="text-slate-300 text-lg leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="text-red-500 font-bold text-3xl">~4 ans</div>
            <div className="text-slate-400 mt-2">Années d’expérience (depuis 2022)</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="text-red-500 font-bold text-3xl">2024</div>
            <div className="text-slate-400 mt-2">Meilleur Jeune Humoriste (Prexelart)</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="text-red-500 font-bold text-3xl">Rodage</div>
            <div className="text-slate-400 mt-2">13 sept 2025 — Silas Bar, Kintambo</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="text-red-500 font-bold text-3xl">Réseaux</div>
            <div className="text-slate-400 mt-2">TikTok: 1388 • Facebook: 606 • Instagram: 273</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Parcours</h2>
            <p className="text-slate-400 text-lg mt-4">
              Formation, scènes marquantes, collaborations, ambition.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-800" />
            <div className="space-y-8">
              {parcours.map((step, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div
                    key={`${step.title}-${idx}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                  >
                    <div className={`${isLeft ? "md:pr-12" : "md:pl-12 md:col-start-2"}`}>
                      <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden">
                        <img src={step.image} alt={step.title} className="w-full h-56 object-cover" />
                      </div>
                    </div>

                    <div className={`${isLeft ? "md:pl-12" : "md:pr-12 md:row-start-1"}`}>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="text-red-400 font-semibold">{step.year}</div>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-slate-400 line-clamp-2">{step.details}</p>
                        <div className="mt-4">
                          <button
                            onClick={() => setSelectedParcours(step)}
                            className="px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg hover:border-red-500 transition-colors"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="card-glass max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Envie de rire ?</h3>
            <p className="text-slate-400 mb-6">
              Découvrez mes prochains spectacles et réservez vos places dès maintenant.
            </p>
            <a
              href="/events"
              className="btn btn-primary text-lg flex items-center justify-center gap-2 w-fit mx-auto"
            >
              Voir les spectacles <FaTicketAlt className="text-3xl" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
