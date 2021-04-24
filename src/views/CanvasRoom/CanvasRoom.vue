<template>
  <v-container fluid class="fill-parent-height">
    <v-row v-if="$apollo.loading"></v-row>
    <v-row v-else class="fill-parent-height">
      <v-col v-if="this.$io.isConnected">
        <canvas-room-canvas v-bind="brush" />
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
import { Component, Vue, Watch } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import CanvasRoomDetailsSidebar from './components/CanvasRoomDetailsSidebar.vue';
import CanvasRoomPaletteSidebar from './components/CanvasRoomPaletteSidebar.vue';
import CanvasRoomCanvas from './components/CanvasRoomCanvas.vue';
import { CanvasSocketEmits, CanvasSocketEvents } from '.';

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
            owner {
              id
              displayName
              profilePictureUrl
            }
          }
        }
      `,
      fetchPolicy: 'cache-and-network',
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
export default class Home extends Vue {
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
      console.log('Someone joined!');
    };

    const onMeJoined = (roomId: string) => {
      if (roomId !== this.currentRoom?.id) {
        this.$route.params.roomId = roomId;
        throw new Error('Joined the wrong room');
      }
      console.log('Me joined');
    };

    this.unbind = () => {
      socket?.emit('canvas-drawlist:leave', roomId);
      socket.off('canvas-drawlist:user-join', onSomeoneJoined);
      socket.off('canvas-drawlist:join', onMeJoined);
    };

    console.log('bind');

    socket.on('canvas-drawlist:user-join', onSomeoneJoined);
    socket.on('canvas-drawlist:join', onMeJoined);

    socket.emit('canvas-drawlist:join', roomId);

    // socket.emit('canvas-drawlist:join', roomId);
  }
}
</script>
