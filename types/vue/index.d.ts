import { AuthService } from '../../src/plugins/auth';
declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $auth: AuthService;
  }
}
