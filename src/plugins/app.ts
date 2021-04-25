import Vue from 'vue';
import _Vue from 'vue';

export class App extends Vue {
  public get version(): string {
    return '2.1.1';
  }
}

const inst = new App();
export default inst;

export class AppOptions {
  //
}

export function AppPlugin<AppOptions>(
  Vue: typeof _Vue,
  options?: AppOptions
): void {
  // do stuff with options
  Vue.prototype.$app = inst;
}

// export default AuthPlugin;

Vue.use(AppPlugin);
