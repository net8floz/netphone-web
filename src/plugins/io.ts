import Vue from 'vue';
import _Vue from 'vue';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
interface Events {
  auth: () => void;
  ready: (socketUserId: string) => void;
}

interface Emits {
  auth: (token: string | null, version: string) => void;
}

let socket: Socket<Events, Emits> | null = null;
let retry = false;
export class SocketIO extends Vue {
  public isConnected = false;
  public isAuthorized = false;
  public socketUserId = '';

  constructor() {
    super({
      data: {
        isConnected: false,
        isAuthorized: false,
        socketUserId: '',
        roomDetails: {
          name: 'none',
          users: [],
          guestCount: 0,
        },
      },
    });
  }

  public getSocket<TEvents, TEmit>() {
    return socket as Socket<TEvents & Events, TEmit & Emits>;
  }

  public connect(authorization: string, appVersion: string) {
    this.disconnect();

    socket = io(process.env.VUE_APP_SOCKET_IO_ENDPOINT as string, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        authorization: authorization || '',
      },
    });

    retry = true;

    socket.on('ready', (socketUserId) => {
      this.socketUserId = socketUserId;
      this.isConnected = true;
      socket?.emit('auth', authorization, appVersion);
    });

    socket.on('auth', () => {
      this.isAuthorized = true;
    });

    socket.on('disconnect', () => {
      this.socketUserId = '';
      this.isConnected = false;
      this.isAuthorized = false;
      this.connect(authorization, appVersion);
    });

    socket.connect();
  }

  public disconnect() {
    socket?.disconnect();
    retry = false;
    this.isConnected = false;
    this.isAuthorized = false;
    socket = null;
  }
}

const inst = new SocketIO();
export default inst;

export class SocketIOPluginOptions {
  // add stuff
}

export function SocketIOPlugin<SocketIOPluginOptions>(
  Vue: typeof _Vue,
  options?: SocketIOPluginOptions
): void {
  // do stuff with options
  Vue.prototype.$io = inst;
}

// export default AuthPlugin;

Vue.use(SocketIOPlugin);
