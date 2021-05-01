<template>
  <div>
    <component v-if="!!roomComponent" v-bind:is="roomComponent" :room="room" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import GqlMe from '@/components/GqlMe.vue';
import gql from 'graphql-tag';
import { schema } from '@/gql';

@Component({
  components: {
    GqlMe,
  },
  apollo: {
    room: {
      query: gql`
        query room($id: String!) {
          room(id: $id) {
            id
            isPublic
            name
            gameType
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
export default class Room extends Vue {
  private room!: schema.Room;

  private get roomComponent(): unknown {
    if (!this.room) {
      return null;
    }
    switch (this.room.gameType) {
      case 'CanvasFreeDraw':
        return () =>
          import(
            /* webpackChunkName: "FreeDrawGameRoom" */ '@/views/FreeDrawGameRoom/FreeDrawGameRoom.vue'
          );
    }
    return null;
  }
}
</script>
