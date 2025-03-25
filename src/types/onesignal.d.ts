// Definições de tipos para OneSignal

// Interface para inicialização do OneSignal
interface IInitObject {
  appId: string;
  safari_web_id?: string;
  notifyButton?: {
    enable?: boolean;
    size?: 'small' | 'medium' | 'large';
    position?: 'bottom-left' | 'bottom-right';
    offset?: {
      bottom?: string;
      left?: string;
      right?: string;
    };
    prenotify?: boolean;
    showCredit?: boolean;
    text?: {
      [key: string]: string;
    };
    colors?: {
      [key: string]: string;
    };
  };
  allowLocalhostAsSecureOrigin?: boolean;
}

// Opções para o slidedown de push
interface IPushSlidedownOptions {
  autoPrompt?: boolean;
  categoryOptions?: {
    positiveUpdateButton?: string;
    negativeUpdateButton?: string;
    savingButtonText?: string;
    errorButtonText?: string;
    confirmMessage?: string;
    actionMessage?: string;
    exampleNotificationTitleDesktop?: string;
    exampleNotificationMessageDesktop?: string;
    exampleNotificationCaption?: string;
    acceptButton?: string;
    cancelButton?: string;
  }
}

// Interfaces para os módulos do OneSignal
interface IOneSignalSlidedown {
  // Métodos para slide-down
  promptPush(options?: IPushSlidedownOptions): Promise<void>;
  promptPushCategories(): Promise<void>;
  promptSms(): Promise<void>;
  promptEmail(): Promise<void>;
  promptSmsAndEmail(): Promise<void>;
}

interface IOneSignalNotifications {
  // Métodos para notificações
  permission: 'default' | 'granted' | 'denied';
  requestPermission(): Promise<void>;
  setDefaultUrl(url: string): Promise<void>;
  setDefaultTitle(title: string): Promise<void>;
}

interface IOneSignalSession {
  // Métodos para sessão
}

interface IOneSignalUser {
  // Métodos para usuário
  addEmail(email: string): Promise<void>;
  addSms(smsNumber: string): Promise<void>;
  addTag(key: string, value: string): Promise<void>;
  addTags(tags: Record<string, string>): Promise<void>;
}

interface IOneSignalDebug {
  // Métodos para debug
}

// Interface principal do OneSignal
interface IOneSignalOneSignal {
  Slidedown: IOneSignalSlidedown;
  Notifications: IOneSignalNotifications;
  Session: IOneSignalSession;
  User: IOneSignalUser;
  Debug: IOneSignalDebug;
  login(externalId: string, jwtToken?: string): Promise<void>;
  logout(): Promise<void>;
  init(options: IInitObject): Promise<void>;
  setConsentGiven(consent: boolean): Promise<void>;
  setConsentRequired(requiresConsent: boolean): Promise<void>;
  on(event: string, listener: (eventData: any) => void): void;
}

// Declaração global para TypeScript
declare global {
  interface Window {
    OneSignal?: IOneSignalOneSignal;
    OneSignalDeferred?: ((OneSignal: IOneSignalOneSignal) => void)[];
  }
}

export {}; 