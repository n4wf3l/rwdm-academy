import { Request, RequestType, RequestStatus } from "@/components/RequestDetailsModal";

export const MOCK_ADMINS = [
  { id: "1", name: "Sophie Dupont" },
  { id: "2", name: "Thomas Martin" },
  { id: "3", name: "Elise Bernard" },
  { id: "4", name: "Michael Lambert" },
  { id: "5", name: "Julien Verstraeten" },
  { id: "6", name: "Marie Lejeune" },
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: "REQ-001",
    type: "registration",
    name: "Lucas Dubois",
    email: "lucas.dubois@example.com",
    phone: "+32 470 12 34 56",
    date: new Date(2023, 7, 15),
    status: "new",
    details: {
      playerFirstName: "Lucas",
      playerLastName: "Dubois",
      playerBirthDate: new Date(2010, 5, 12),
      season: "2025/2026",
      birthPlace: "Bruxelles",
      address: "Rue de la Loi 16",
      postalCode: "1000",
      city: "Bruxelles",
      currentClub: "RSC Anderlecht",
      position: "Milieu de terrain",
      category: "U14",
      primaryGuardian: {
        type: "father",
        firstName: "Jean",
        lastName: "Dubois",
        phone: "+32 470 12 34 56",
        email: "jean.dubois@example.com",
        address: "Rue de la Loi 16",
        postalCode: "1000",
        mobilePhone: "+32 470 12 34 56"
      },
      secondaryGuardian: {
        type: "mother",
        firstName: "Marie",
        lastName: "Dubois",
        phone: "+32 470 98 76 54",
        email: "marie.dubois@example.com",
        address: "Rue de la Loi 16",
        postalCode: "1000",
        mobilePhone: "+32 470 98 76 54"
      },
      imageConsent: true,
      signatureDate: new Date(2023, 7, 15),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-002",
    type: "selection-tests",
    name: "Emma Petit",
    email: "emma.petit@example.com",
    phone: "+32 475 23 45 67",
    date: new Date(2023, 7, 16),
    status: "assigned",
    assignedTo: "1",
    details: {
      playerFirstName: "Emma",
      playerLastName: "Petit",
      playerBirthDate: new Date(2011, 3, 23),
      coreGroup: "U12",
      testPeriod: {
        startDate: new Date(2023, 8, 1),
        endDate: new Date(2023, 8, 15)
      },
      currentClub: "Standard de Liège",
      previousClub: "RFC Liège",
      position: "Attaquant",
      primaryGuardian: {
        type: "mother",
        firstName: "Sophie",
        lastName: "Petit",
        phone: "+32 475 23 45 67",
        email: "sophie.petit@example.com"
      },
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-003",
    type: "accident-report",
    name: "Noah Lambert",
    email: "noah.lambert@example.com",
    phone: "+32 478 34 56 78",
    date: new Date(2023, 7, 17),
    status: "in-progress",
    assignedTo: "2",
    details: {
      playerFirstName: "Noah",
      playerLastName: "Lambert",
      affiliationNumber: "BE12345678",
      clubName: "RWDM",
      accidentDescription: "Lors de l'entraînement du 15 juillet 2023, Noah est tombé et s'est blessé à la cheville droite. Il a été transporté à l'hôpital pour des examens complémentaires qui ont révélé une entorse de grade 2.",
      documentUrl: "#",
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      signatureDate: new Date(2023, 7, 17)
    }
  },
  {
    id: "REQ-004",
    type: "responsibility-waiver",
    name: "Chloé Moreau",
    email: "chloe.moreau@example.com",
    phone: "+32 479 45 67 89",
    date: new Date(2023, 7, 18),
    status: "completed",
    assignedTo: "3",
    details: {
      playerFirstName: "Chloé",
      playerLastName: "Moreau",
      playerBirthDate: new Date(2009, 11, 5),
      clubName: "KAA Gent",
      primaryGuardian: {
        type: "mother",
        firstName: "Isabelle",
        lastName: "Moreau",
        phone: "+32 479 45 67 89",
        email: "isabelle.moreau@example.com"
      },
      signatureDate: new Date(2023, 7, 18),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      approvalText: "Lu et approuvé"
    }
  },
  {
    id: "REQ-005",
    type: "registration",
    name: "Louis Lefevre",
    email: "louis.lefevre@example.com",
    phone: "+32 471 56 78 90",
    date: new Date(2023, 7, 19),
    status: "rejected",
    assignedTo: "4",
    details: {
      playerFirstName: "Louis",
      playerLastName: "Lefevre",
      playerBirthDate: new Date(2012, 2, 8),
      season: "2025/2026",
      birthPlace: "Gand",
      address: "Avenue Louise 143",
      postalCode: "1050",
      city: "Bruxelles",
      currentClub: "Club Brugge",
      position: "Gardien",
      category: "U11",
      primaryGuardian: {
        type: "father",
        firstName: "Pierre",
        lastName: "Lefevre",
        phone: "+32 471 56 78 90",
        email: "pierre.lefevre@example.com",
        address: "Avenue Louise 143",
        postalCode: "1050",
        mobilePhone: "+32 471 56 78 90"
      },
      imageConsent: false,
      signatureDate: new Date(2023, 7, 19),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-006",
    type: "registration",
    name: "Axel Van Damme",
    email: "axel.vandamme@example.com",
    phone: "+32 478 98 76 54",
    date: new Date(2023, 8, 3),
    status: "new",
    details: {
      playerFirstName: "Axel",
      playerLastName: "Van Damme",
      playerBirthDate: new Date(2013, 1, 15),
      season: "2025/2026",
      birthPlace: "Anvers",
      address: "Rue du Commerce 78",
      postalCode: "1040",
      city: "Bruxelles",
      currentClub: "Royal Antwerp FC",
      position: "Défenseur",
      category: "U12",
      primaryGuardian: {
        type: "father",
        firstName: "Marc",
        lastName: "Van Damme",
        phone: "+32 478 98 76 54",
        email: "marc.vandamme@example.com",
        address: "Rue du Commerce 78",
        postalCode: "1040",
        mobilePhone: "+32 478 98 76 54"
      },
      imageConsent: true,
      signatureDate: new Date(2023, 8, 3),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-007",
    type: "selection-tests",
    name: "Léa Janssens",
    email: "lea.janssens@example.com",
    phone: "+32 479 12 34 56",
    date: new Date(2023, 8, 5),
    status: "assigned",
    assignedTo: "5",
    details: {
      playerFirstName: "Léa",
      playerLastName: "Janssens",
      playerBirthDate: new Date(2010, 7, 21),
      coreGroup: "U15",
      testPeriod: {
        startDate: new Date(2023, 9, 10),
        endDate: new Date(2023, 9, 24)
      },
      currentClub: "KRC Genk",
      previousClub: "KV Mechelen",
      position: "Milieu de terrain",
      primaryGuardian: {
        type: "mother",
        firstName: "Caroline",
        lastName: "Janssens",
        phone: "+32 479 12 34 56",
        email: "caroline.janssens@example.com"
      },
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-008",
    type: "accident-report",
    name: "Maxime Dupont",
    email: "maxime.dupont@example.com",
    phone: "+32 472 23 45 67",
    date: new Date(2023, 8, 12),
    status: "in-progress",
    assignedTo: "6",
    details: {
      playerFirstName: "Maxime",
      playerLastName: "Dupont",
      affiliationNumber: "BE87654321",
      clubName: "RWDM",
      accidentDescription: "Pendant le match du 10 septembre 2023 contre Union Saint-Gilloise, Maxime a subi une collision avec un autre joueur. Il a ressenti une douleur vive au genou droit. L'IRM a confirmé une lésion du ligament latéral interne.",
      documentUrl: "#",
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      signatureDate: new Date(2023, 8, 12)
    }
  },
  {
    id: "REQ-009",
    type: "responsibility-waiver",
    name: "Elise Martin",
    email: "elise.martin@example.com",
    phone: "+32 473 34 56 78",
    date: new Date(2023, 8, 15),
    status: "new",
    details: {
      playerFirstName: "Elise",
      playerLastName: "Martin",
      playerBirthDate: new Date(2011, 9, 17),
      clubName: "Standard de Liège",
      primaryGuardian: {
        type: "father",
        firstName: "Antoine",
        lastName: "Martin",
        phone: "+32 473 34 56 78",
        email: "antoine.martin@example.com"
      },
      signatureDate: new Date(2023, 8, 15),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      approvalText: "Lu et approuvé"
    }
  },
  {
    id: "REQ-010",
    type: "registration",
    name: "Gabriel Lemaire",
    email: "gabriel.lemaire@example.com",
    phone: "+32 475 45 67 89",
    date: new Date(2023, 8, 18),
    status: "in-progress",
    assignedTo: "2",
    details: {
      playerFirstName: "Gabriel",
      playerLastName: "Lemaire",
      playerBirthDate: new Date(2009, 4, 29),
      season: "2025/2026",
      birthPlace: "Charleroi",
      address: "Rue de la Station 22",
      postalCode: "1200",
      city: "Bruxelles",
      currentClub: "Sporting Charleroi",
      position: "Attaquant",
      category: "U16",
      primaryGuardian: {
        type: "mother",
        firstName: "Nathalie",
        lastName: "Lemaire",
        phone: "+32 475 45 67 89",
        email: "nathalie.lemaire@example.com",
        address: "Rue de la Station 22",
        postalCode: "1200",
        mobilePhone: "+32 475 45 67 89"
      },
      imageConsent: true,
      signatureDate: new Date(2023, 8, 18),
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png"
    }
  },
  {
    id: "REQ-011",
    type: "accident-report",
    name: "Juliette Durand",
    email: "juliette.durand@example.com",
    phone: "+32 476 56 78 90",
    date: new Date(2023, 8, 20),
    status: "in-progress",
    assignedTo: "1",
    details: {
      playerFirstName: "Juliette",
      playerLastName: "Durand",
      affiliationNumber: "BE45678912",
      clubName: "RWDM",
      accidentDescription: "Durant l'entraînement du 18 septembre 2023, Juliette a fait une chute et s'est blessée à l'épaule gauche. Une radiographie a révélé une fracture de la clavicule nécessitant une immobilisation de 6 semaines.",
      documentUrl: "#",
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      signatureDate: new Date(2023, 8, 20)
    }
  },
  {
    id: "REQ-012",
    type: "accident-report",
    name: "Thomas Lefebvre",
    email: "thomas.lefebvre@example.com",
    phone: "+32 477 67 89 01",
    date: new Date(2023, 8, 22),
    status: "in-progress",
    assignedTo: "3",
    details: {
      playerFirstName: "Thomas",
      playerLastName: "Lefebvre",
      affiliationNumber: "BE78901234",
      clubName: "RWDM",
      accidentDescription: "Lors du match amical du 20 septembre 2023 contre RSC Anderlecht, Thomas a reçu un coup au visage qui a causé une fracture du nez. Une intervention chirurgicale est prévue la semaine prochaine pour réaligner le cartilage nasal.",
      documentUrl: "#",
      signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barack_Obama_signature.svg/1280px-Barack_Obama_signature.svg.png",
      signatureDate: new Date(2023, 8, 22)
    }
  }
];
