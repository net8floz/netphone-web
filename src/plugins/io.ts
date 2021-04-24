import Vue from 'vue';
import _Vue from 'vue';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { EventEmitter } from 'event-emitter-typesafe';
import {
  SerializedDrawlistCommand,
  DrawListCommand,
  serializeDrawListCommand,
} from '../views/CanvasRoom';

interface Events {
  auth: () => void;
}

interface Emits {
  auth: (token: string | null, version: string) => void;
}

let socket: Socket<Events, Emits> | null = null;
let retry = false;
export class SocketIO extends Vue {
  public isConnected = false;
  public isAuthorized = false;

  constructor() {
    super({
      data: {
        isConnected: false,
        isAuthorized: false,
        roomDetails: {
          name: 'none',
          users: [],
          guestCount: 0,
        },
      },
    });
  }

  public connect(authorization: string | null) {
    this.disconnect();

    socket = io(process.env.VUE_APP_SOCKET_IO_ENDPOINT as string, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        authorization: authorization || '',
      },
    });

    retry = true;

    socket.on('auth', () => {
      this.isAuthorized = true;
    });

    socket.on('connect', () => {
      this.isConnected = true;
      socket?.emit('auth', authorization, process.env.VUE_APP_VERSION || '0');
    });

    socket.on('disconnect', () => {
      this.isConnected = false;
      this.isAuthorized = false;
      this.connect(authorization);
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
