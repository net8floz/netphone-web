<template>
  <div class="sidebar d-flex flex-column flex-grow-0" :style="style">
    <slot name="default" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class GameRoomSidebar extends Vue {
  @Prop(String) height!: string;

  private get style() {
    return `height: ${this.height || '720px'};`;
  }
}
</script>

<style lang="scss">
.sidebar {
  overflow-y: scroll;
  width: 300px;
  height: 720px;
}
</style>
