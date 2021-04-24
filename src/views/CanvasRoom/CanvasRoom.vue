<template>
  <v-container fluid class="fill-parent-height">
    <v-row v-if="$apollo.loading">Wait</v-row>
    <v-row v-else class="fill-parent-height">
      <v-col>
        <canvas-room-canvas v-bind="brush" />
      </v-col>
      <v-col cols="3">
        <canvas-room-palette-sidebar
          v-bind="brush"
          @change="(val) => (brush = val)"
          :room="currentRoom"
        />
        <canvas-room-details-sidebar class="mt-6" :room="currentRoom" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import CanvasRoomDetailsSidebar from './components/CanvasRoomDetailsSidebar.vue';
import CanvasRoomPaletteSidebar from './components/CanvasRoomPaletteSidebar.vue';
import CanvasRoomCanvas from './components/CanvasRoomCanvas.vue';

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

  private brush = {
    color1: '#000000',
    color2: 'ffffff',
    thickness: 2,
  };
}
</script>
