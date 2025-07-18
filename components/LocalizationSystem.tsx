import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocalizationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  availableLanguages: Array<{ code: string; name: string; flag: string }>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.directory': 'Directory',
    'nav.events': 'Events',
    'nav.blog': 'Blog',
    'nav.membership': 'Become a Member',
    
    // Common
    'common.welcome': 'Welcome',
    'common.contact': 'Contact',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    
    // Admin Dashboard
    'admin.dashboard': 'Admin Dashboard',
    'admin.members': 'Member Management',
    'admin.committees': 'Committee Management',
    'admin.projects': 'Project Management',
    'admin.dues': 'Dues Management',
    'admin.documents': 'Document Management',
    'admin.quotations': 'Quotation Management',
    'admin.analytics': 'Analytics Dashboard',
    'admin.overview': 'Overview',
    
    // Email System
    'email.compose': 'Compose Email',
    'email.campaigns': 'Email Campaigns',
    'email.templates': 'Email Templates',
    'email.contacts': 'Contact Lists',
    'email.analytics': 'Email Analytics',
    'email.send': 'Send Email',
    'email.schedule': 'Schedule Email',
    'email.subject': 'Subject',
    'email.body': 'Email Body',
    'email.recipients': 'Recipients'
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.directory': 'Directorio',
    'nav.events': 'Eventos',
    'nav.blog': 'Blog',
    'nav.membership': 'Únete',
    
    // Common
    'common.welcome': 'Bienvenido',
    'common.contact': 'Contacto',
    'common.email': 'Correo',
    'common.phone': 'Teléfono',
    'common.address': 'Dirección',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loading': 'Cargando...',
    'common.success': 'Éxito',
    'common.error': 'Error',
    
    // Admin Dashboard
    'admin.dashboard': 'Panel de Administración',
    'admin.members': 'Gestión de Miembros',
    'admin.committees': 'Gestión de Comités',
    'admin.projects': 'Gestión de Proyectos',
    'admin.dues': 'Gestión de Cuotas',
    'admin.documents': 'Gestión de Documentos',
    'admin.quotations': 'Gestión de Cotizaciones',
    'admin.analytics': 'Panel de Análisis',
    'admin.overview': 'Resumen',
    
    // Email System
    'email.compose': 'Redactar Correo',
    'email.campaigns': 'Campañas de Correo',
    'email.templates': 'Plantillas de Correo',
    'email.contacts': 'Listas de Contactos',
    'email.analytics': 'Análisis de Correo',
    'email.send': 'Enviar Correo',
    'email.schedule': 'Programar Correo',
    'email.subject': 'Asunto',
    'email.body': 'Cuerpo del Correo',
    'email.recipients': 'Destinatarios'
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.directory': 'Annuaire',
    'nav.events': 'Événements',
    'nav.blog': 'Blog',
    'nav.membership': 'Devenir Membre',
    
    // Common
    'common.welcome': 'Bienvenue',
    'common.contact': 'Contact',
    'common.email': 'Email',
    'common.phone': 'Téléphone',
    'common.address': 'Adresse',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.create': 'Créer',
    'common.update': 'Mettre à jour',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.loading': 'Chargement...',
    'common.success': 'Succès',
    'common.error': 'Erreur'
  }
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('rotary-language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('rotary-language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[language as keyof typeof translations]?.[key as keyof typeof translations['en']] || key;
    
    if (params) {
      return Object.entries(params).reduce((text, [param, value]) => {
        return text.replace(`{{${param}}}`, value);
      }, translation);
    }
    
    return translation;
  };

  const contextValue: LocalizationContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    availableLanguages
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Higher-order component for easy translation
export function withTranslation<P extends object>(Component: React.ComponentType<P>) {
  return function TranslatedComponent(props: P) {
    const { t } = useLocalization();
    return <Component {...props} t={t} />;
  };
}