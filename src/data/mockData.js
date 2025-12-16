// Données de démo pour les événements
export const eventsData = [
    {
        id: 1,
        title: "Rire Sans Frontières",
        date: "2025-12-15",
        time: "19:00",
        venue: "Théâtre de la Ville",
        city: "Kinshasa",
        description: "Une soirée explosive de stand-up avec les meilleurs moments d'Evan Lesnar. Préparez-vous à rire aux éclats !",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 15000, currency: "CDF", available: 150 },
            { type: "VIP", price: 30000, currency: "CDF", available: 50 },
        ],
        status: "available"
    },
    {
        id: 2,
        title: "Comedy Night Special",
        date: "2025-12-22",
        time: "20:00",
        venue: "Grand Hôtel",
        city: "Lubumbashi",
        description: "Spectacle unique à Lubumbashi ! Evan Lesnar débarque avec son humour décapant et ses sketches cultes.",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 12000, currency: "CDF", available: 200 },
            { type: "VIP", price: 25000, currency: "CDF", available: 75 },
        ],
        status: "available"
    },
    {
        id: 3,
        title: "Le Rire de Fin d'Année",
        date: "2025-12-31",
        time: "21:00",
        venue: "Pullman Hotel",
        city: "Kinshasa",
        description: "Célébrez le Nouvel An avec Evan Lesnar ! Une soirée inoubliable mêlant humour, musique et festivités.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
        tickets: [
            { type: "Standard", price: 20000, currency: "CDF", available: 100 },
            { type: "VIP", price: 50000, currency: "CDF", available: 30 },
            { type: "Premium Table", price: 200000, currency: "CDF", available: 10 },
        ],
        status: "selling-fast"
    },
    {
        id: 4,
        title: "Campus Comedy Tour",
        date: "2026-01-10",
        time: "18:00",
        venue: "Université de Kinshasa",
        city: "Kinshasa",
        description: "Evan Lesnar s'invite sur les campus ! Tarifs étudiants disponibles pour cette soirée spéciale.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
        tickets: [
            { type: "Étudiant", price: 5000, currency: "CDF", available: 300 },
            { type: "Standard", price: 10000, currency: "CDF", available: 100 },
        ],
        status: "available"
    },
];

// Données pour la galerie
export const galleryData = [
    {
        id: 1,
        type: "image",
        url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
        title: "Spectacle au Théâtre",
        category: "performance"
    },
    {
        id: 2,
        type: "image",
        url: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop",
        title: "En coulisses",
        category: "backstage"
    },
    {
        id: 3,
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800&h=600&fit=crop",
        title: "Best Of 2024",
        category: "video"
    },
    {
        id: 4,
        type: "image",
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
        title: "Rencontre avec les fans",
        category: "events"
    },
    {
        id: 5,
        type: "image",
        url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop",
        title: "Répétition",
        category: "backstage"
    },
    {
        id: 6,
        type: "image",
        url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
        title: "Festival de Comédie",
        category: "performance"
    },
];

// Informations sur l'artiste
export const artistInfo = {
    name: "Evan Lesnar",
    tagline: " ''Donc c'est le foufou que tu mange...'' ",
    bio: `Evan Lesnar est un humoriste congolais reconnu pour son style unique mêlant observations du quotidien et satire sociale. Avec plus de 10 ans d'expérience sur scène, il a conquis le public de Kinshasa à Lubumbashi, en passant par la diaspora africaine.

Son humour intelligent et accessible aborde des thèmes universels tout en restant profondément ancré dans la réalité congolaise. Que ce soit sur scène, à la télévision ou sur les réseaux sociaux, Evan Lesnar ne cesse de faire rire et réfléchir son public.`,
    stats: {
        shows: "200+",
        fans: "500K+",
        years: "10+",
        awards: "5"
    },
    achievements: [
        "Meilleur Humoriste RDC 2023",
        "Spectacle le plus vendu 2022",
        "Prix du Public - Festival du Rire 2021",
        "Tournée internationale 2020-2024",
        "Plus de 100M de vues sur les réseaux sociaux"
    ]
};

// Méthodes de paiement Mobile Money
export const paymentMethods = [
    {
        id: "mpesa",
        name: "M-Pesa",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/320px-M-PESA_LOGO-01.svg.png",
        instructions: "Composez *150# et suivez les instructions"
    },
    {
        id: "orange",
        name: "Orange Money",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/320px-Orange_logo.svg.png",
        instructions: "Composez #150# et suivez les instructions"
    },
    {
        id: "airtel",
        name: "Airtel Money",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Airtel_logo.svg/320px-Airtel_logo.svg.png",
        instructions: "Composez *501# et suivez les instructions"
    },
    {
        id: "africell",
        name: "Africell Money",
        logo: "https://africell.cd/wp-content/uploads/2021/03/logo.png",
        instructions: "Composez *555# et suivez les instructions"
    },
];
