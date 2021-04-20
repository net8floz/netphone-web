import Vue from 'vue';
import _Vue from 'vue';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

type RoomDetails = {
  name: string;
  users: string[];
  guestCount: number;
};

interface Events {
  'room-details:update': (roomDetails: RoomDetails) => void;
}

interface Emits {
  auth: (token: string | null) => void;
}

let socket: Socket<Events, Emits> | null = null;

export class SocketIO extends Vue {
  public isConnected = false;

  public roomDetails: RoomDetails = {
    name: 'none',
    users: [],
    guestCount: 0,
  };

  constructor() {
    super({
      data: {
        isConnected: false,
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
      transports: ['websocket'],
      extraHeaders: {
        authorization: authorization || '',
      },
    });

    socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected');
      socket?.emit('auth', authorization);
    });

    socket.on('disconnect', () => {
      this.disconnect();
    });

    socket.on('room-details:update', (details) => {
      this.roomDetails = details;
    });

    socket.connect();
  }

  public disconnect() {
    socket?.disconnect();
    this.isConnected = false;
    socket = null;
  }

  public joinRoom(id: string) {
    socket?.send('join-room', id);
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
