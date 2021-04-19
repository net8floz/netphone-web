<template>
  <div class="d-flex flex-grow-1 screen-events">
    <v-container class="fill-parent-height">
      <v-row class="fill-parent-height">
        <v-col>
          <div class="d-flex flex-column fill-parent-height">
            <v-card>
              Canvas
              <draw-canvas />
              Canvas
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GqlMe from '@/components/GqlMe.vue';
import DrawCanvas from '@/components/Canvas.vue';

@Component({
  components: {
    GqlMe,
    DrawCanvas,
  },
})
export default class Home extends Vue {}
</script>
