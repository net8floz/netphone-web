<template>
  <game-room />
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
// import CanvasPaletteSidebar from '@/views/CanvasRoom/components/CanvasRoomPaletteSidebar.vue';
import gql from 'graphql-tag';
import { schema } from '@/gql';

import GameLog from '@/components/GameLog.vue';
import GameRoom from '@/components/GameRoom.vue';

@Component({
  components: {
    // CanvasPaletteSidebar,
    GameLog,
  },
})
export default class GameBPPRoom extends Vue {}
</script>

<style lang="scss">
/* div {
  border: solid thin #ddd;
} */

.main-attraction {
  background-color: #f2f1dc;
  width: 720px;
  height: 720px;

  .v-tabs-items {
    background: none;
  }
}

.logs {
  height: 300px;
  margin: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
}

.sidebar {
  overflow-y: scroll;
  width: 300px;
  height: 720px;
}
</style>
