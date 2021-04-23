import Vue from 'vue';
import _Vue from 'vue';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { EventEmitter } from 'event-emitter-typesafe';
import {
  SerializedDrawlistCommand,
  DrawListCommand,
  serializeDrawListCommand,
} from '../components/Canvas';

type RoomDetails = {
  name: string;
  users: string[];
  guestCount: number;
};

type CanvasDrawlistUpdate = {
  cursor: number;
  tail: number;
  commands: SerializedDrawlistCommand[];
};

interface Events {
  'room-details:update': (roomDetails: RoomDetails) => void;
  'canvas-drawlist:update': (update: CanvasDrawlistUpdate) => void;
}

interface Emits {
  auth: (token: string | null, version: string) => void;
  'canvas-drawlist:update': (
    localCursor: number,
    cursor: number,
    commands: SerializedDrawlistCommand[]
  ) => void;
  'canvas-drawlist:sync': (localCursor: number, cursor: number) => void;
}

interface EEvents {
  connected: null;
  disconnected: null;
  'room-details:update': RoomDetails;
  'canvas-drawlist:update': CanvasDrawlistUpdate;
}

class SocketEvents extends EventEmitter<EEvents> {}

const events = new SocketEvents();

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

  public get events(): SocketEvents {
    return events;
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

    socket.on('connect', () => {
      this.isConnected = true;
      socket?.emit('auth', authorization, process.env.VUE_APP_VERSION || '0');
      this.events.emit('connected', null);
    });

    socket.on('disconnect', () => {
      this.disconnect();
      this.events.emit('disconnected', null);
    });

    socket.on('room-details:update', (details) => {
      this.roomDetails = details;
      this.events.emit('room-details:update', details);
    });

    socket.on('canvas-drawlist:update', (update) => {
      this.events.emit('canvas-drawlist:update', update);
    });

    socket.connect();
  }

  public disconnect() {
    socket?.disconnect();
    this.isConnected = false;
    socket = null;
  }

  public sendDrawlistCommands(
    localCursor: number,
    cursor: number,
    commands: DrawListCommand[]
  ) {
    socket?.emit(
      'canvas-drawlist:update',
      localCursor,
      cursor,
      commands.map((i) =>
        serializeDrawListCommand(i, this.$io.roomDetails.name)
      )
    );
  }

  public sendDrawlistSync(localCursor: number, cursor: number) {
    socket?.emit('canvas-drawlist:sync', localCursor, cursor);
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
