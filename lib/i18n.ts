export type Language = "en" | "fr"

export const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
]

export interface Translations {
  nav: {
    home: string
    login: string
    logout: string
    admin: string
    barber: string
    services: string
    about: string
    contact: string
    register: string
  }
  hero: {
    title: string
    subtitle: string
    startFree: string
    learnMore: string
  }
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
    loginButton: string
    registerButton: string
    invalidCredentials: string
    registrationSuccess: string
    loginSuccess: string
    logoutSuccess: string
  }
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
    completed: string
    cancelled: string
    dashboard: string
  }
  createBarber: {
    addNewBarber: string
    createAccount: string
    fullName: string
    enterName: string
    enterEmail: string
    enterPassword: string
    createBarber: string
  }
  barberDashboard: {
    welcome: string
    setUpStore: string
    createProfile: string
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
  booking: {
    service: string
    date: string
    time: string
    price: string
    currency: string
    priceFormat: string
    minutes: string
  }
  store: {
    title: string
    address: string
    description: string
    services: string
    workingHours: string
    contact: string
    images: string
  }
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
  blockTime: {
    blockTime: string
    blockTimeSlots: string
    selectDate: string
    startTime: string
    endTime: string
    reason: string
    reasonPlaceholder: string
    blockSlot: string
    blockedTimes: string
    noBlockedTimes: string
    removeBlock: string
  }
  registration: {
    title: string
    subtitle: string
    fullName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    city: string
    register: string
    success: string
    successMessage: string
    loginCredentials: string
    copyCredentials: string
    continueToLogin: string
    passwordRequirements: string
    passwordMinLength: string
    passwordsMatch: string
    passwordsDontMatch: string
  }
  common: {
    cancel: string
    save: string
    delete: string
    edit: string
    loading: string
    error: string
    success: string
    linkCopied: string
    copyToClipboard: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      login: "Login",
      logout: "Logout",
      admin: "Admin",
      barber: "Barber",
      services: "Services",
      about: "About",
      contact: "Contact",
      register: "Register",
    },
    hero: {
      title: "Modern Barber Management System",
      subtitle: "Streamline your barbershop operations with our comprehensive booking and management platform",
      startFree: "Start Free",
      learnMore: "Learn More",
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
      loginButton: "Sign In",
      registerButton: "Create Account",
      invalidCredentials: "Invalid email or password",
      registrationSuccess: "Registration successful",
      loginSuccess: "Login successful",
      logoutSuccess: "Logout successful",
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
      completed: "Completed",
      cancelled: "Cancelled",
      dashboard: "Admin Dashboard",
    },
    createBarber: {
      addNewBarber: "Add New Barber",
      createAccount: "Create a new barber account for your team",
      fullName: "Full Name",
      enterName: "Enter barber's full name",
      enterEmail: "Enter barber's email",
      enterPassword: "Enter a secure password",
      createBarber: "Create Barber",
    },
    barberDashboard: {
      welcome: "Welcome",
      setUpStore: "Set Up Your Store",
      createProfile: "Create your barbershop profile to start accepting appointments",
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
    booking: {
      service: "Service",
      date: "Date",
      time: "Time",
      price: "Price",
      currency: "€",
      priceFormat: "€{price}",
      minutes: "minutes",
    },
    store: {
      title: "Store Name",
      address: "Address",
      description: "Description",
      services: "Services",
      workingHours: "Working Hours",
      contact: "Contact",
      images: "Images",
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
      blockTimeSlots: "Block time slots when you're not available",
      selectDate: "Select Date",
      startTime: "Start Time",
      endTime: "End Time",
      reason: "Reason",
      reasonPlaceholder: "e.g., Lunch break, Personal appointment",
      blockSlot: "Block Time Slot",
      blockedTimes: "Blocked Times",
      noBlockedTimes: "No blocked times",
      removeBlock: "Remove Block",
    },
    registration: {
      title: "Create Account",
      subtitle: "Join our platform and start managing your barbershop",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone",
      city: "City",
      register: "Register",
      success: "Registration Successful!",
      successMessage: "Your account has been created successfully",
      loginCredentials: "Login Credentials",
      copyCredentials: "Copy Credentials",
      continueToLogin: "Continue to Login",
      passwordRequirements: "Password Requirements:",
      passwordMinLength: "At least 6 characters",
      passwordsMatch: "Passwords match",
      passwordsDontMatch: "Passwords must match",
    },
    common: {
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      linkCopied: "Link copied to clipboard",
      copyToClipboard: "Copy to clipboard",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      login: "Connexion",
      logout: "Déconnexion",
      admin: "Admin",
      barber: "Barbier",
      services: "Services",
      about: "À propos",
      contact: "Contact",
      register: "S'inscrire",
    },
    hero: {
      title: "Système de Gestion de Salon Moderne",
      subtitle:
        "Rationalisez les opérations de votre salon de coiffure avec notre plateforme complète de réservation et de gestion",
      startFree: "Commencer Gratuitement",
      learnMore: "En Savoir Plus",
    },
    auth: {
      signIn: "Se Connecter",
      signInToAccount: "Connectez-vous à votre compte",
      email: "Email",
      password: "Mot de passe",
      enterEmail: "Entrez votre email",
      enterPassword: "Entrez votre mot de passe",
      demoCredentials: "Identifiants de démonstration:",
      admin: "Administrateur",
      barber: "Coiffeur",
      loginButton: "Se connecter",
      registerButton: "Créer un compte",
      invalidCredentials: "Email ou mot de passe invalide",
      registrationSuccess: "Inscription réussie",
      loginSuccess: "Connexion réussie",
      logoutSuccess: "Déconnexion réussie",
    },
    admin: {
      welcome: "Bienvenue",
      totalBarbers: "Total des Barbiers",
      totalAppointments: "Total des Rendez-vous",
      todayAppointments: "Rendez-vous d'Aujourd'hui",
      barbers: "Barbiers",
      allAppointments: "Tous les Rendez-vous",
      manageBarbers: "Gérez vos barbiers et consultez leurs performances",
      viewStatistics: "Voir les statistiques de rendez-vous et gérer les réservations",
      addBarber: "Ajouter un Barbier",
      name: "Nom",
      appointments: "Rendez-vous",
      joined: "Rejoint",
      client: "Client",
      status: "Statut",
      confirmed: "confirmé",
      pending: "en attente",
      completed: "Terminé",
      cancelled: "Annulé",
      dashboard: "Tableau de Bord Admin",
    },
    createBarber: {
      addNewBarber: "Ajouter un Nouveau Barbier",
      createAccount: "Créer un nouveau compte barbier pour votre équipe",
      fullName: "Nom Complet",
      enterName: "Entrez le nom complet du barbier",
      enterEmail: "Entrez l'email du barbier",
      enterPassword: "Entrez un mot de passe sécurisé",
      createBarber: "Créer le Barbier",
    },
    barberDashboard: {
      welcome: "Bienvenue",
      setUpStore: "Configurez Votre Salon",
      createProfile: "Créez votre profil de salon de coiffure pour commencer à accepter les rendez-vous",
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
    booking: {
      service: "Service",
      date: "Date",
      time: "Heure",
      price: "Prix",
      currency: "€",
      priceFormat: "{price}€",
      minutes: "minutes",
    },
    store: {
      title: "Nom du Magasin",
      address: "Adresse",
      description: "Description",
      services: "Services",
      workingHours: "Heures d'Ouverture",
      contact: "Contact",
      images: "Images",
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
      blockTimeSlots: "Bloquer des créneaux horaires quand vous n'êtes pas disponible",
      selectDate: "Sélectionner une Date",
      startTime: "Heure de Début",
      endTime: "Heure de Fin",
      reason: "Raison",
      reasonPlaceholder: "ex: Pause déjeuner, Rendez-vous personnel",
      blockSlot: "Bloquer le Créneau",
      blockedTimes: "Temps Bloqués",
      noBlockedTimes: "Aucun temps bloqué",
      removeBlock: "Supprimer le Blocage",
    },
    registration: {
      title: "Créer un Compte",
      subtitle: "Rejoignez notre plateforme et commencez à gérer votre salon",
      fullName: "Nom Complet",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le Mot de passe",
      phone: "Téléphone",
      city: "Ville",
      register: "S'inscrire",
      success: "Inscription Réussie!",
      successMessage: "Votre compte a été créé avec succès",
      loginCredentials: "Identifiants de Connexion",
      copyCredentials: "Copier les Identifiants",
      continueToLogin: "Continuer vers la Connexion",
      passwordRequirements: "Exigences du Mot de passe:",
      passwordMinLength: "Au moins 6 caractères",
      passwordsMatch: "Les mots de passe correspondent",
      passwordsDontMatch: "Les mots de passe doivent correspondre",
    },
    common: {
      cancel: "Annuler",
      save: "Sauvegarder",
      delete: "Supprimer",
      edit: "Modifier",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      linkCopied: "Lien copié dans le presse-papiers",
      copyToClipboard: "Copier dans le presse-papiers",
    },
  },
}

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en"
  try {
    const stored = localStorage.getItem("barberbook-language") as Language
    return stored && languages.some((l) => l.code === stored) ? stored : "en"
  } catch {
    return "en"
  }
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("barberbook-language", language)
    document.documentElement.lang = language
  } catch {
    // Ignore storage errors
  }
}

export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en"
  try {
    const browserLang = navigator.language.split("-")[0] as Language
    return languages.some((l) => l.code === browserLang) ? browserLang : "en"
  } catch {
    return "en"
  }
}

export function getFallbackTranslation(): Translations {
  return translations.en
}

export function safeGetTranslation(language?: Language): Translations {
  if (!language) return translations.en
  return translations[language] || translations.en
}

export function formatPrice(amount: number, language: Language = "en"): string {
  const t = translations[language]
  return t.booking.priceFormat.replace("{price}", amount.toFixed(2))
}

export default translations
