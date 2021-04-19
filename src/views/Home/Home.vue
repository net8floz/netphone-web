<template>
  <div class="d-flex flex-grow-1 screen-events">
    <v-container class="fill-parent-height">
      <v-row class="fill-parent-height">
        <v-col>
          <div class="d-flex flex-column fill-parent-height">
            <canvas-parent />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GqlMe from '@/components/GqlMe.vue';
import DrawCanvas from '@/components/Canvas/Canvas.vue';
import CanvasParent from '@/components/Canvas/CanvasParent.vue';
@Component({
  components: {
    GqlMe,
    CanvasParent,
  },
})
export default class Home extends Vue {}
</script>
