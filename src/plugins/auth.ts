import Vue from 'vue';
import _Vue from 'vue';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';

import { EventEmitter } from 'events';

console.log("BEGIN");
console.log(process.env);


const firebaseConfig = JSON.parse(
  process.env.VUE_APP_FIREBASE_CONFIG as string
);

// Initialize Firebase
const fb = firebase.initializeApp(firebaseConfig).auth();

export interface OAuthLoginResults {
  userId: string;
  token: string;
  newAccount: boolean;
}

export type AuthEvents = 'change' | 'login' | 'logout';

export class AuthService extends Vue {
  public static oAuthLoginEndpoint = `${process.env.VUE_APP_OAUTH_LOGIN_ENDPOINT}`;

  public static oAuthCallbackEndpoint = `${process.env.VUE_APP_SELF_ENDPOINT}/oauth/login/popup/callback`;

  constructor() {
    super({
      data: {
        uid: '',
        isAuthorized: false,
        token: '',
        isInitialized: '',
        _unsub: undefined,
      },
    });
  }

  public uid = '';

  public isInitialized = false;

  public token: string | undefined;

  public isAuthorized = false;

  private _unsub: ((...args: any[]) => any) | undefined;

  public readonly events = new EventEmitter();

  // private _lastKnownEmail = localStorage.getItem('_email') ? (localStorage.getItem('_email') as string) : '';

  public initialize() {
    if (this._unsub) {
      this._unsub();
      this.events.removeAllListeners();
      this.isInitialized = false;
      this.isAuthorized = false;
    }

    this._unsub = fb.onAuthStateChanged(async () => {
      const wasLoggedIn = this.isAuthorized;
      if (fb.currentUser === null) {
        this.uid = '';
        this.token = undefined;
        this.isAuthorized = false;
        if (wasLoggedIn || !this.isInitialized) {
          this.events.emit('logout' as AuthEvents);
        }
      } else {
        this.uid = fb.currentUser.uid;
        this.token = await fb.currentUser.getIdToken();
        this.isAuthorized = true;
        if (!wasLoggedIn || !this.isAuthorized) {
          this.events.emit('login' as AuthEvents);
        }
      }
      this.isInitialized = true;
      this.events.emit('change' as AuthEvents);
    });
  }

  public async signOut() {
    if (!this.isInitialized) {
      await new Promise((r) => setTimeout(r, 100));
    }

    await fb.signOut();
    while (this.isAuthorized) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  public async awaitInit() {
    if (this.isInitialized) {
      return;
    }

    while (!this.isInitialized) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async awaitAuth() {
    if (this.isAuthorized) {
      return;
    }

    while (!this.isAuthorized) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: AuthEvents, listener: (...args: any[]) => void): this {
    this.events.on(event, listener);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: AuthEvents, listener: (...args: any[]) => void): this {
    this.events.off(event, listener);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(event: AuthEvents, ...args: any[]): boolean {
    return this.events.emit(event, ...args);
  }

  public async loginWithToken(token: string) {
    await fb.signInWithCustomToken(token);
  }

  public async openOAuthLoginWindow(): Promise<OAuthLoginResults> {
    return this.openPopupWindow(
      'Sign In To Discord',
      AuthService.oAuthLoginEndpoint,
      AuthService.oAuthCallbackEndpoint
    );
  }

  private async openPopupWindow<TResults>(
    title: string,
    url: string,
    destination: string,
    inParams = {},
    width = 600,
    height = 800
  ) {
    // eslint-disable-next-line no-param-reassign
    const params = {
      ...inParams,
      destination,
    };

    const windowBounds = {
      x: (window.screen.width - width) / 2,
      y: (window.screen.height - height) / 2,
      width,
      height,
    };

    const windowParams: { [name: string]: string | number } = {
      resizable: 'no',
      toolbar: 'no',
      scrollbar: 'no',
      status: 'no',
      menubar: 'no',
      location: 'no',
      directories: 'no',
      top: windowBounds.y,
      left: windowBounds.x,
      screenX: windowBounds.x,
      screenY: windowBounds.y,
      width: windowBounds.width,
      height: windowBounds.width,
    };

    const strUrlParams = Object.keys(params)
      .map((key) => `${key}=${(params as never)[key]}`)
      .join('&');

    const strWindowParams = Object.keys(windowParams)
      .map((key) => `${key}=${windowParams[key]}`)
      .join(',');

    const w = window.open(`${url}?${strUrlParams}`, title, strWindowParams);
    if (!w) {
      localStorage.removeItem('oauth_callback_state');
      throw new Error('Could not open window');
    }
    w.focus();

    while (w.opener) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((cont) => setTimeout(cont, 1000));
    }

    const result: TResults = JSON.parse(
      atob(localStorage.getItem('oauth_callback_state') as string)
    );
    localStorage.removeItem('oauth_callback_state');
    return result;
  }
}

const auth = new AuthService();
export default auth;

// export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
export function AuthPlugin<AuthPluginOptions>(
  Vue: typeof _Vue,
  options?: AuthPluginOptions
): void {
  // do stuff with options
  Vue.prototype.$auth = auth;
}

export class AuthPluginOptions {
  // add stuff
}

// export default AuthPlugin;

Vue.use(AuthPlugin);
