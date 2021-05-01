<template>
  <canvas-game-room :room="room" />
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import CanvasGameRoom from '@/components/CanvasGameRoom.vue';

@Component({
  components: {
    CanvasGameRoom,
  },
})
export default class GameFreeDrawRoom extends Vue {
  @Prop(Object) room!: schema.Room;
}
</script>
