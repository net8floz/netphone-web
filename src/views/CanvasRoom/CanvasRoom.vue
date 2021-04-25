<template>
  <v-container fluid class="fill-parent-height">
    <v-row v-if="$apollo.loading"></v-row>
    <v-row v-else class="fill-parent-height">
      <v-col v-if="this.$io.isConnected">
        <canvas-room-canvas
          @on-commands="sendLocalCommands"
          ref="canvas"
          v-bind="brush"
        />
      </v-col>
      <v-col v-else> No socket connection! </v-col>
      <v-col cols="3">
        <canvas-room-palette-sidebar v-model="brush" :room="currentRoom" />
        <canvas-room-details-sidebar class="mt-6" :room="currentRoom" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import CanvasRoomDetailsSidebar from './components/CanvasRoomDetailsSidebar.vue';
import CanvasRoomPaletteSidebar from './components/CanvasRoomPaletteSidebar.vue';
import CanvasRoomCanvas from './components/CanvasRoomCanvas.vue';
import {
  CanvasDrawlistUpdate,
  CanvasSocketEmits,
  CanvasSocketEvents,
  DrawListCommand,
  serializeDrawListCommand,
  unserilaizeDrawListCommand,
} from '.';

@Component({
  components: {
    CanvasRoomDetailsSidebar,
    CanvasRoomPaletteSidebar,
    CanvasRoomCanvas,
  },
  apollo: {
    currentRoom: {
      query: gql`
        query room($id: String!) {
          room(id: $id) {
            id
            isPublic
            name
            users {
              id
              displayName
              isGuest
              profilePictureUrl
            }
            owner {
              id
              displayName
              profilePictureUrl
            }
          }
        }
      `,
      fetchPolicy: 'cache-and-network',
      pollInterval: 5000,
      variables(): schema.QueryRoomArgs {
        return {
          id: this.$route.params.roomId,
        };
      },
      skip(): boolean {
        return !this.$route.params.roomId;
      },
      update(query: schema.Query) {
        return query.room;
      },
    },
  },
})
export default class CanvasRoom extends Vue {
  @Ref() canvas!: CanvasRoomCanvas;
  private currentRoom: schema.Room | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private unbind: ((...args: any[]) => any) | null = null;

  private brush = {
    color1: '#000000',
    color2: '#ffffff',
    thickness: 2,
  };

  private beforeDestroy() {
    if (this.unbind) {
      this.unbind();
    }
  }

  private sendLocalCommands(e: {
    localCursor: number;
    cursor: number;
    commands: DrawListCommand[];
  }) {
    const socket = this.$io.getSocket<CanvasSocketEvents, CanvasSocketEmits>();
    if (!socket) {
      throw new Error('No socket!');
    }
    if (e.commands.length > 0) {
      socket.emit(
        'canvas-drawlist:update',
        e.localCursor,
        e.cursor,
        e.commands.map((i) => serializeDrawListCommand(i))
      );
    }
    socket.emit('canvas-drawlist:sync', this.canvas.getCursor());
  }

  @Watch('currentRoom.id')
  private onCurrentRoomIdChanged(roomId: string) {
    if (this.unbind) {
      this.unbind();
    }
    const socket = this.$io.getSocket<CanvasSocketEvents, CanvasSocketEmits>();
    if (!socket) {
      throw new Error('No socket!');
    }

    const onSomeoneJoined = () => {
      this.$apollo.queries.currentRoom.refetch();
    };

    const onMeJoined = (roomId: string) => {
      if (roomId !== this.currentRoom?.id) {
        this.$route.params.roomId = roomId;
        throw new Error('Joined the wrong room');
      }
      this.$apollo.queries.currentRoom.refetch();
    };

    const onServerDrawlistUpdated = (update: CanvasDrawlistUpdate) => {
      update.commands.forEach((command) => {
        this.canvas.acceptServerCommand(unserilaizeDrawListCommand(command));
      });
    };

    this.unbind = () => {
      socket?.emit('canvas-drawlist:leave', roomId);
      socket.off('canvas-drawlist:user-join', onSomeoneJoined);
      socket.off('canvas-drawlist:join', onMeJoined);
      socket.off('canvas-drawlist:update', onServerDrawlistUpdated);
    };

    socket.on('canvas-drawlist:user-join', onSomeoneJoined);
    socket.on('canvas-drawlist:join', onMeJoined);
    socket.on('canvas-drawlist:update', onServerDrawlistUpdated);

    socket.emit('canvas-drawlist:join', roomId);
  }
}
</script>
