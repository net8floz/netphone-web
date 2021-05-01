<template>
  <game-room :room="room">
    <game-room-sidebar>
      <game-room-user-list />
      <game-room-user-list />
    </game-room-sidebar>
    <div class="d-flex main-attraction">
      <v-tabs dark color="#F2F1DC" background-color="rgba(0,0,0,0.8)">
        <v-tab>Paintings</v-tab>
        <v-tab>Prompts</v-tab>
        <v-spacer />
        <div class="pt-2 mr-3">2 Minutes Remaining</div>
        <v-tab-item>
          <div style="width: 600px; height: 560px"></div>
        </v-tab-item>
        <v-tab-item> World </v-tab-item>
      </v-tabs>
    </div>
    <game-room-sidebar>
      <canvas-game-room-palette-sidebar />
    </game-room-sidebar>
  </game-room>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GameRoom from '@/components/GameRoom.vue';
import GameRoomSidebar from '@/components/GameRoomSidebar.vue';
import GameRoomUserList from '@/components/GameRoomUserList.vue';
import CanvasGameRoomPaletteSidebar from '@/components/CanvasGameRoomPaletteSidebar.vue';
import { schema } from '@/gql';

@Component({
  components: {
    CanvasGameRoomPaletteSidebar,
    GameRoom,
    GameRoomSidebar,
    GameRoomUserList,
  },
})
export default class CanvasGameRoom extends Vue {
  @Prop(Object) room!: schema.Room;
}
</script>

<style lang="scss">
.main-attraction {
  background-color: #f2f1dc;
  width: 720px;
  height: 720px;

  .v-tabs-items {
    background: none;
  }
}

.sidebar {
  overflow-y: scroll;
  width: 300px;
  height: 720px;
}
</style>
