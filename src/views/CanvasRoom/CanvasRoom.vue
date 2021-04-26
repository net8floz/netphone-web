<template>
  <v-container fluid class="fill-parent-height">
    {{ userCanvasProfile }}
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
        <canvas-room-palette-sidebar
          :brush="brush"
          :current-palette-ids="currentColorPaletteIds"
          @brush-changed="(val) => (brush = val)"
          @palettes-changed="(val) => (currentColorPaletteIds = val)"
          :room="currentRoom"
        />
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
import { BufferedSend } from '../../BufferedSend';

@Component({
  components: {
    CanvasRoomDetailsSidebar,
    CanvasRoomPaletteSidebar,
    CanvasRoomCanvas,
  },
  apollo: {
    userCanvasProfile: {
      query: gql`
        query myUserCanvasProfile {
          me {
            id
            canvasProfile {
              id
              color1
              color2
              openColorPaletteIds
              thickness
            }
          }
        }
      `,
      update(query: schema.Query) {
        return query.me.canvasProfile;
      },
    },
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
  private userCanvasProfile!: schema.UserCanvasProfile;
  private currentRoom: schema.Room | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private unbind: ((...args: any[]) => any) | null = null;

  private brushSend = new BufferedSend();

  private profileUpdateTimeout = 0;

  private brush = {
    color1: '#000000',
    color2: '#ffffff',
    thickness: 2,
  };

  private currentColorPaletteIds: string[] = [];

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

  @Watch('userCanvasProfile')
  private onUserCanvasProfileChanged(profile: schema.UserCanvasProfile) {
    if (profile) {
      this.brush.color1 = profile.color1;
      this.brush.color2 = profile.color2;
      this.brush.thickness = profile.thickness;
      this.currentColorPaletteIds = profile.openColorPaletteIds;
    }
  }

  @Watch('brush.color1')
  private async onColor1Changed(color1: string) {
    if (!this.userCanvasProfile) {
      return;
    }
    if (this.userCanvasProfile.color1 !== color1) {
      this.updateProfile();
    }
  }

  @Watch('brush.color2')
  private async onColor2Changed(color2: string) {
    if (!this.userCanvasProfile) {
      return;
    }
    if (this.userCanvasProfile.color2 !== color2) {
      this.updateProfile();
    }
  }

  @Watch('brush.thickness')
  private async onThicknessChanged(thickness: number) {
    if (!this.userCanvasProfile) {
      return;
    }

    if (this.userCanvasProfile.thickness !== thickness) {
      this.updateProfile();
    }
  }

  private async updateProfile() {
    const input: schema.UserCanvasProfileSetInput = {
      id: this.userCanvasProfile.id,
      color1: this.brush.color1,
      color2: this.brush.color2,
      thickness: this.brush.thickness,
      openColorPaletteIds: this.userCanvasProfile.openColorPaletteIds,
    };

    this.brushSend.send(async () => {
      await this.$apollo.mutate({
        mutation: gql`
          mutation updateMyUserCanvasProfileE(
            $input: UserCanvasProfileSetInput!
          ) {
            userCanvasProfileSet(input: $input) {
              id
              color1
              color2
              thickness
              openColorPaletteIds
            }
          }
        `,
        variables: {
          input,
        },
      });
    });
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
      if (!this.canvas) {
        // commands are sent redundantly so ignoring these is okay
        // they will come back later
        return;
      }
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
