export type Language = "en" | "fr"

// Define and export the languages array
export const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
]

export interface Translations {
  // Navigation & Header
  nav: {
    home: string
    login: string
    logout: string
    admin: string
    barber: string
    getStarted: string
    learnMore: string
  }

  // Home Page
  home: {
    title: string
    subtitle: string
    description: string
    heroTitle: string
    heroSubtitle: string
    ourBarbershops: string
    findAndBook: string
    bookNow: string
    readyToTransform: string
    readyDescription: string
    startFreeTrial: string
    copyright: string
    features: {
      title: string
      subtitle: string
      smartScheduling: {
        title: string
        description: string
      }
      clientManagement: {
        title: string
        description: string
      }
      serviceShowcase: {
        title: string
        description: string
      }
      professionalDesign: {
        title: string
        description: string
      }
      realTimeUpdates: {
        title: string
        description: string
      }
      multiLocation: {
        title: string
        description: string
      }
    }
  }

  // Login & Auth
  auth: {
    signIn: string
    signInToAccount: string
    email: string
    password: string
    enterEmail: string
    enterPassword: string
    demoCredentials: string
    admin: string
    barber: string
    accessDenied: string
    noPermission: string
    contactAdmin: string
    goHome: string
  }

  // Booking Page
  booking: {
    bookAppointment: string
    selectPreferred: string
    currentTime: string
    selectedDate: string
    today: string
    tomorrow: string
    futureDate: string
    passed: string
    about: string
    ourServices: string
    selectDate: string
    selectTime: string
    checking: string
    booked: string
    fullName: string
    phoneOptional: string
    additionalNotes: string
    specialRequests: string
    bookingConfirmed: string
    confirmationEmail: string
    service: string
    date: string
    time: string
    duration: string
    price: string
    minutes: string
    grayBooked: string
    redPassed: string
    debug: string
    selectService: string
    selectDateTime: string
    pastTimeError: string
    noLongerAvailable: string
    selectDifferentTime: string
    alreadyPassed: string
    selectFutureTime: string
    justBooked: string
    cannotBookPast: string
    selectFutureDate: string
    failedToBook: string
    yourFullName: string
    yourEmail: string
    yourPhone: string
  }

  // Admin Dashboard
  admin: {
    welcome: string
    totalBarbers: string
    totalAppointments: string
    todayAppointments: string
    barbers: string
    allAppointments: string
    manageBarbers: string
    viewStatistics: string
    addBarber: string
    name: string
    appointments: string
    joined: string
    client: string
    status: string
    confirmed: string
    pending: string
  }

  // Barber Dashboard
  barberDashboard: {
    welcome: string
    setUpStore: string
    createProfile: string
    startAccepting: string
    createStore: string
    todayAppointments: string
    totalAppointments: string
    services: string
    totalRevenue: string
    recentAppointments: string
    viewManage: string
    appointmentCalendar: string
    calendarFormat: string
    storeInformation: string
    manageStore: string
    editStore: string
    manageServices: string
    managePricing: string
    viewPublicPage: string
    copyLink: string
  }

  // Store Setup
  store: {
    createStore: string
    editStore: string
    setupProfile: string
    updateInformation: string
    storeName: string
    address: string
    description: string
    imageUrl: string
    optional: string
    tellClients: string
    exampleUrl: string
    cancel: string
    update: string
    create: string
    exampleName: string
    exampleAddress: string
  }

  // Service Management
  serviceManagement: {
    manageServices: string
    addEditRemove: string
    addNewService: string
    editService: string
    serviceName: string
    duration: string
    currentServices: string
    noServices: string
    exampleService: string
    describeService: string
    updateService: string
    addService: string
    deleteConfirm: string
  }

  // Block Time
  blockTime: {
    blockTime: string
    blockTimeDescription: string
    addBlockedTime: string
    startTime: string
    endTime: string
    reason: string
    reasonPlaceholder: string
    currentBlockedTimes: string
    noBlockedTimes: string
    deleteConfirm: string
  }

  // Create Barber
  createBarber: {
    addNewBarber: string
    createAccount: string
    loginManage: string
    fullName: string
    enterName: string
    enterEmail: string
    enterPassword: string
    createBarber: string
  }

  // Calendar
  calendar: {
    selectDate: string
    noAppointments: string
    months: string[]
    days: string[]
  }

  // Common
  common: {
    loading: string
    error: string
    success: string
    save: string
    delete: string
    edit: string
    add: string
    remove: string
    confirm: string
    cancel: string
    close: string
    next: string
    previous: string
    submit: string
    required: string
    min: string
    max: string
    characters: string
    linkCopied: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      login: "Login",
      logout: "Logout",
      subscribe: "Start for Free",
      admin: "Admin",
      barber: "Barber",
      getStarted: "Get Started",
      learnMore: "Learn More",
    },
    home: {
      title: "BarberBook",
      subtitle: "Professional Barber Management",
      description: "Complete appointment management system for modern barbershops",
      heroTitle: "Streamline Your Barbershop",
      heroSubtitle:
        "Complete appointment management system for modern barbershops. Manage bookings, showcase services, and grow your business.",
      ourBarbershops: "Our Barbershops",
      findAndBook: "Find and book your perfect barbershop",
      bookNow: "Book Now",
      readyToTransform: "Ready to Transform Your Barbershop?",
      readyDescription: "Join hundreds of barbers who have streamlined their business with BarberBook",
      startFreeTrial: "Start Free Trial",
      copyright: "© 2024 BarberBook. All rights reserved.",
      features: {
        title: "Everything You Need",
        subtitle: "Powerful features designed specifically for barbershops and their clients",
        smartScheduling: {
          title: "Smart Scheduling",
          description: "Intuitive calendar and table views for managing appointments efficiently",
        },
        clientManagement: {
          title: "Client Management",
          description: "Easy booking system for clients with contact information tracking",
        },
        serviceShowcase: {
          title: "Service Showcase",
          description: "Beautiful public pages to display services, prices, and store information",
        },
        professionalDesign: {
          title: "Professional Design",
          description: "Modern, responsive design that looks great on all devices",
        },
        realTimeUpdates: {
          title: "Real-time Updates",
          description: "Instant notifications and updates for new appointments",
        },
        multiLocation: {
          title: "Multi-location",
          description: "Support for multiple barbers and locations with centralized management",
        },
      },
    },
    auth: {
      signIn: "Sign In",
      signInToAccount: "Sign in to your account",
      email: "Email",
      password: "Password",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      demoCredentials: "Demo Credentials:",
      admin: "Admin",
      barber: "Barber",
      accessDenied: "Access Denied",
      noPermission: "You don't have permission to access this page.",
      contactAdmin: "Please contact your administrator if you believe this is an error.",
      goHome: "Go Home",
    },
    booking: {
      bookAppointment: "Book Your Appointment",
      selectPreferred: "Select your preferred service, date, and time",
      currentTime: "Current time",
      selectedDate: "Selected date",
      today: "Today",
      tomorrow: "Tomorrow",
      futureDate: "Future Date",
      passed: "Passed",
      about: "About",
      ourServices: "Our Services",
      selectDate: "Select Date",
      selectTime: "Select Time",
      checking: "Checking...",
      booked: "Booked",
      fullName: "Full Name",
      phoneOptional: "Phone Number (Optional)",
      additionalNotes: "Additional Notes (Optional)",
      specialRequests: "Any special requests or notes...",
      bookingConfirmed: "Booking Confirmed!",
      confirmationEmail:
        "Your appointment has been successfully booked. You will receive a confirmation email shortly.",
      service: "Service",
      date: "Date",
      time: "Time",
      duration: "Duration",
      price: "Price",
      minutes: "minutes",
      grayBooked: "• Gray slots are booked.",
      redPassed: "• Red slots have passed.",
      debug: "• Debug",
      selectService: "Please select a service, date, and time",
      selectDateTime: "Please select a service, date, and time",
      pastTimeError: "This time slot has already passed. Please select a future time.",
      noLongerAvailable: "This time slot is no longer available. Please select a different time.",
      selectDifferentTime: "Please select a different time.",
      alreadyPassed: "This time slot has already passed. Please select a future time.",
      selectFutureTime: "Please select a future time.",
      justBooked: "This time slot was just booked. Please select a different time.",
      cannotBookPast: "Cannot book appointments in the past. Please select a future time.",
      selectFutureDate: "Please select a future date.",
      failedToBook: "Failed to book appointment",
      yourFullName: "Your full name",
      yourEmail: "your@email.com",
      yourPhone: "Your phone number",
    },
    admin: {
      welcome: "Welcome",
      totalBarbers: "Total Barbers",
      totalAppointments: "Total Appointments",
      todayAppointments: "Today's Appointments",
      barbers: "Barbers",
      allAppointments: "All Appointments",
      manageBarbers: "Manage barber accounts and view their statistics",
      viewStatistics: "View all appointments across all barbers",
      addBarber: "Add Barber",
      name: "Name",
      appointments: "Appointments",
      joined: "Joined",
      client: "Client",
      status: "Status",
      confirmed: "confirmed",
      pending: "pending",
    },
    barberDashboard: {
      welcome: "Welcome",
      setUpStore: "Set Up Your Store",
      createProfile: "Create your barbershop profile to start accepting appointments",
      startAccepting: "to start accepting appointments",
      createStore: "Create Store",
      todayAppointments: "Today's Appointments",
      totalAppointments: "Total Appointments",
      services: "Services",
      totalRevenue: "Total Revenue",
      recentAppointments: "Recent Appointments",
      viewManage: "View and manage your upcoming appointments",
      appointmentCalendar: "Appointment Calendar",
      calendarFormat: "View your appointments in calendar format",
      storeInformation: "Store Information",
      manageStore: "Manage your store details and settings",
      editStore: "Edit Store",
      manageServices: "Manage Services",
      managePricing: "Manage your services and pricing",
      viewPublicPage: "View Public Page",
      copyLink: "Copy Link",
    },
    store: {
      createStore: "Create Your Store",
      editStore: "Edit Store",
      setupProfile: "Set up your barbershop profile to start accepting appointments",
      updateInformation: "Update your store information",
      storeName: "Store Name",
      address: "Address",
      description: "Description",
      imageUrl: "Image URL (optional)",
      optional: "optional",
      tellClients: "Tell clients about your barbershop...",
      exampleUrl: "https://example.com/image.jpg",
      cancel: "Cancel",
      update: "Update Store",
      create: "Create Store",
      exampleName: "e.g., Classic Cuts Barbershop",
      exampleAddress: "e.g., 123 Main Street, Downtown",
    },
    serviceManagement: {
      manageServices: "Manage Services",
      addEditRemove: "Add, edit, or remove services for your barbershop",
      addNewService: "Add New Service",
      editService: "Edit Service",
      serviceName: "Service Name",
      duration: "Duration (minutes)",
      currentServices: "Current Services",
      noServices: "No services added yet.",
      exampleService: "e.g., Classic Haircut",
      describeService: "Describe this service...",
      updateService: "Update Service",
      addService: "Add Service",
      deleteConfirm: "Are you sure you want to delete this service?",
    },
    blockTime: {
      blockTime: "Block Time",
      blockTimeDescription: "Block specific time periods to prevent customer bookings",
      addBlockedTime: "Add Blocked Time",
      startTime: "Start Time",
      endTime: "End Time",
      reason: "Reason (Optional)",
      reasonPlaceholder: "e.g., Lunch break, Personal appointment, Maintenance...",
      currentBlockedTimes: "Current Blocked Times",
      noBlockedTimes: "No blocked times set.",
      deleteConfirm: "Are you sure you want to remove this blocked time?",
    },
    createBarber: {
      addNewBarber: "Add New Barber",
      createAccount: "Create a new barber account. They will be able to log in and manage their store.",
      loginManage: "They will be able to log in and manage their store.",
      fullName: "Full Name",
      enterName: "Enter barber's full name",
      enterEmail: "Enter barber's email",
      enterPassword: "Enter password",
      createBarber: "Create Barber",
    },
    calendar: {
      selectDate: "Select a date",
      noAppointments: "No appointments for this date",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      remove: "Remove",
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      required: "required",
      min: "min",
      max: "max",
      characters: "characters",
      linkCopied: "Link copied!",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      login: "Connexion",
      logout: "Déconnexion",
      subscribe: "Commencer Gratuitement",
      admin: "Admin",
      barber: "Barbier",
      getStarted: "Commencer",
      learnMore: "En savoir plus",
    },
    home: {
      title: "BarberBook",
      subtitle: "Gestion Professionnelle de Salon de Coiffure",
      description: "Système complet de gestion de rendez-vous pour salons de coiffure modernes",
      heroTitle: "Optimisez Votre Salon de Coiffure",
      heroSubtitle:
        "Système complet de gestion de rendez-vous pour salons de coiffure modernes. Gérez les réservations, présentez vos services et développez votre entreprise.",
      ourBarbershops: "Nos Salons de Coiffure",
      findAndBook: "Trouvez et réservez votre salon de coiffure parfait",
      bookNow: "Réserver Maintenant",
      readyToTransform: "Prêt à Transformer Votre Salon de Coiffure ?",
      readyDescription: "Rejoignez des centaines de barbiers qui ont optimisé leur entreprise avec BarberBook",
      startFreeTrial: "Commencer l'Essai Gratuit",
      copyright: "© 2024 BarberBook. Tous droits réservés.",
      features: {
        title: "Tout Ce Dont Vous Avez Besoin",
        subtitle: "Fonctionnalités puissantes conçues spécifiquement pour les salons de coiffure et leurs clients",
        smartScheduling: {
          title: "Planification Intelligente",
          description: "Vues calendrier et tableau intuitives pour gérer efficacement les rendez-vous",
        },
        clientManagement: {
          title: "Gestion de Clientèle",
          description: "Système de réservation facile pour les clients avec suivi des informations de contact",
        },
        serviceShowcase: {
          title: "Vitrine de Services",
          description: "Belles pages publiques pour afficher les services, prix et informations du salon",
        },
        professionalDesign: {
          title: "Design Professionnel",
          description: "Design moderne et réactif qui s'affiche parfaitement sur tous les appareils",
        },
        realTimeUpdates: {
          title: "Mises à Jour en Temps Réel",
          description: "Notifications instantanées et mises à jour pour les nouveaux rendez-vous",
        },
        multiLocation: {
          title: "Multi-emplacements",
          description: "Support pour plusieurs barbiers et emplacements avec gestion centralisée",
        },
      },
    },
    auth: {
      signIn: "Se Connecter",
      signInToAccount: "Connectez-vous à votre compte",
      email: "Email",
      password: "Mot de passe",
      enterEmail: "Entrez votre email",
      enterPassword: "Entrez votre mot de passe",
      demoCredentials: "Identifiants de démonstration :",
      admin: "Admin",
      barber: "Barbier",
      accessDenied: "Accès Refusé",
      noPermission: "Vous n'avez pas la permission d'accéder à cette page.",
      contactAdmin: "Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.",
      goHome: "Retour à l'Accueil",
    },
    booking: {
      bookAppointment: "Réservez Votre Rendez-vous",
      selectPreferred: "Sélectionnez votre service, date et heure préférés",
      currentTime: "Heure actuelle",
      selectedDate: "Date sélectionnée",
      today: "Aujourd'hui",
      tomorrow: "Demain",
      futureDate: "Date Future",
      passed: "Passé",
      about: "À propos",
      ourServices: "Nos Services",
      selectDate: "Sélectionner la Date",
      selectTime: "Sélectionner l'Heure",
      checking: "Vérification...",
      booked: "Réservé",
      fullName: "Nom Complet",
      phoneOptional: "Numéro de Téléphone (Optionnel)",
      additionalNotes: "Notes Supplémentaires (Optionnel)",
      specialRequests: "Demandes spéciales ou notes...",
      bookingConfirmed: "Réservation Confirmée !",
      confirmationEmail:
        "Votre rendez-vous a été réservé avec succès. Vous recevrez un email de confirmation sous peu.",
      service: "Service",
      date: "Date",
      time: "Heure",
      duration: "Durée",
      price: "Prix",
      minutes: "minutes",
      grayBooked: "• Les créneaux gris sont réservés.",
      redPassed: "• Les créneaux rouges sont passés.",
      debug: "• Debug",
      selectService: "Veuillez sélectionner un service, une date et une heure",
      selectDateTime: "Veuillez sélectionner un service, une date et une heure",
      pastTimeError: "Ce créneau horaire est déjà passé. Veuillez sélectionner une heure future.",
      noLongerAvailable: "Ce créneau horaire n'est plus disponible. Veuillez sélectionner une heure différente.",
      selectDifferentTime: "Veuillez sélectionner une heure différente.",
      alreadyPassed: "Ce créneau horaire est déjà passé. Veuillez sélectionner une heure future.",
      selectFutureTime: "Veuillez sélectionner une heure future.",
      justBooked: "Ce créneau horaire vient d'être réservé. Veuillez sélectionner une heure différente.",
      cannotBookPast: "Impossible de réserver des rendez-vous dans le passé. Veuillez sélectionner une heure future.",
      selectFutureDate: "Veuillez sélectionner une date future.",
      failedToBook: "Échec de la réservation du rendez-vous",
      yourFullName: "Votre nom complet",
      yourEmail: "votre@email.com",
      yourPhone: "Votre numéro de téléphone",
    },
    admin: {
      welcome: "Bienvenue",
      totalBarbers: "Total Barbiers",
      totalAppointments: "Total Rendez-vous",
      todayAppointments: "Rendez-vous d'Aujourd'hui",
      barbers: "Barbiers",
      allAppointments: "Tous les Rendez-vous",
      manageBarbers: "Gérer les comptes barbiers et voir leurs statistiques",
      viewStatistics: "Voir tous les rendez-vous de tous les barbiers",
      addBarber: "Ajouter un Barbier",
      name: "Nom",
      appointments: "Rendez-vous",
      joined: "Rejoint",
      client: "Client",
      status: "Statut",
      confirmed: "confirmé",
      pending: "en attente",
    },
    barberDashboard: {
      welcome: "Bienvenue",
      setUpStore: "Configurez Votre Salon",
      createProfile: "Créez votre profil de salon de coiffure pour commencer à accepter les rendez-vous",
      startAccepting: "pour commencer à accepter les rendez-vous",
      createStore: "Créer un Salon",
      todayAppointments: "Rendez-vous d'Aujourd'hui",
      totalAppointments: "Total Rendez-vous",
      services: "Services",
      totalRevenue: "Revenus Totaux",
      recentAppointments: "Rendez-vous Récents",
      viewManage: "Voir et gérer vos rendez-vous à venir",
      appointmentCalendar: "Calendrier des Rendez-vous",
      calendarFormat: "Voir vos rendez-vous au format calendrier",
      storeInformation: "Informations du Salon",
      manageStore: "Gérer les détails et paramètres de votre salon",
      editStore: "Modifier le Salon",
      manageServices: "Gérer les Services",
      managePricing: "Gérer vos services et tarifs",
      viewPublicPage: "Voir la Page Publique",
      copyLink: "Copier le Lien",
    },
    store: {
      createStore: "Créez Votre Salon",
      editStore: "Modifier le Salon",
      setupProfile: "Configurez votre profil de salon de coiffure pour commencer à accepter les rendez-vous",
      updateInformation: "Mettre à jour les informations de votre salon",
      storeName: "Nom du Salon",
      address: "Adresse",
      description: "Description",
      imageUrl: "URL de l'Image (optionnel)",
      optional: "optionnel",
      tellClients: "Parlez de votre salon de coiffure aux clients...",
      exampleUrl: "https://exemple.com/image.jpg",
      cancel: "Annuler",
      update: "Mettre à Jour le Salon",
      create: "Créer le Salon",
      exampleName: "ex., Salon de Coiffure Classique",
      exampleAddress: "ex., 123 Rue Principale, Centre-ville",
    },
    serviceManagement: {
      manageServices: "Gérer les Services",
      addEditRemove: "Ajouter, modifier ou supprimer des services pour votre salon de coiffure",
      addNewService: "Ajouter un Nouveau Service",
      editService: "Modifier le Service",
      serviceName: "Nom du Service",
      duration: "Durée (minutes)",
      currentServices: "Services Actuels",
      noServices: "Aucun service ajouté pour le moment.",
      exampleService: "ex., Coupe Classique",
      describeService: "Décrivez ce service...",
      updateService: "Mettre à Jour le Service",
      addService: "Ajouter le Service",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce service ?",
    },
    blockTime: {
      blockTime: "Bloquer du Temps",
      blockTimeDescription: "Bloquer des créneaux horaires spécifiques pour empêcher les réservations clients",
      addBlockedTime: "Ajouter un Temps Bloqué",
      startTime: "Heure de Début",
      endTime: "Heure de Fin",
      reason: "Raison (Optionnel)",
      reasonPlaceholder: "ex., Pause déjeuner, Rendez-vous personnel, Maintenance...",
      currentBlockedTimes: "Temps Actuellement Bloqués",
      noBlockedTimes: "Aucun temps bloqué défini.",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce temps bloqué ?",
    },
    createBarber: {
      addNewBarber: "Ajouter un Nouveau Barbier",
      createAccount: "Créer un nouveau compte barbier. Il pourra se connecter et gérer son salon.",
      loginManage: "Il pourra se connecter et gérer son salon.",
      fullName: "Nom Complet",
      enterName: "Entrez le nom complet du barbier",
      enterEmail: "Entrez l'email du barbier",
      enterPassword: "Entrez le mot de passe",
      createBarber: "Créer le Barbier",
    },
    calendar: {
      selectDate: "Sélectionnez une date",
      noAppointments: "Aucun rendez-vous pour cette date",
      months: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      remove: "Supprimer",
      confirm: "Confirmer",
      cancel: "Annuler",
      close: "Fermer",
      next: "Suivant",
      previous: "Précédent",
      submit: "Soumettre",
      required: "requis",
      min: "min",
      max: "max",
      characters: "caractères",
      linkCopied: "Lien copié !",
    },
  },
}

// Language detection and management with better error handling
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en"

  try {
    const browserLang = navigator.language?.toLowerCase() || "en"
    if (browserLang.startsWith("fr")) return "fr"
    return "en"
  } catch (error) {
    console.warn("Failed to detect browser language:", error)
    return "en"
  }
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en"

  try {
    const stored = localStorage.getItem("barberbook-language") as Language
    if (stored && ["en", "fr"].includes(stored)) {
      return stored
    }
    // If no valid stored language, detect from browser
    const detected = detectBrowserLanguage()
    setStoredLanguage(detected) // Store the detected language
    return detected
  } catch (error) {
    console.warn("Failed to get stored language:", error)
    return detectBrowserLanguage()
  }
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("barberbook-language", language)
    // Also set document language attribute for accessibility
    document.documentElement.lang = language
  } catch (error) {
    console.warn("Failed to store language:", error)
  }
}

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en
}
