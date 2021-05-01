<template>
  <div>
    <div class="d-flex">
      <div class="title">
        <div>{{ title }}</div>
      </div>
      <slot name="actions"> </slot>
    </div>
    <div class="d-flex">
      <slot name="default"> </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class CanvasGameRoomSidebarSection extends Vue {
  @Prop(String) title!: string;
}
</script>
