<template>
  <v-container fluid class="fill-parent-height">
    <v-row class="fill-parent-height">
      <v-col cols="8" offset="2">
        <div>
          <v-card class="pa-4">
            <div class="d-flex">
              <v-card-title>Pick a room to get started</v-card-title>
              <v-spacer />
              <canvas-lobby-create-room-dialog />
            </div>
            <v-simple-table>
              <thead>
                <tr>
                  <th>Room Name</th>
                  <th>Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-if="!$apollo.loading">
                <tr v-for="room in publicRooms" :key="room.id">
                  <td>{{ room.name }}</td>
                  <td>
                    <div class="d-flex align-center">
                      <v-avatar class="mr-1" size="20">
                        <img :src="room.owner.profilePictureUrl" />
                      </v-avatar>
                      {{ room.owner.displayName }}
                    </div>
                  </td>
                  <td>
                    <v-btn small class="mt-1" :to="getRoomRoute(room.id)"
                      >Join</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
            <div
              v-if="$apollo.loading"
              class="d-flex justify-center align-center"
              style="height: 200px; width: 100%"
            >
              <v-progress-circular
                size="80"
                width="10"
                color="rgba(255,255,255,0.3)"
                indeterminate
              />
            </div>
            <v-alert v-else-if="!publicRooms.length" type="info" class="ma-4">
              There are no rooms!
              <div class="mt-1">Be the first to create a room!</div>
            </v-alert>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import CanvasLobbyCreateRoomDialog from './components/CanvasLobbyCreateRoomDialog.vue';
import { getCanvasRoomRoute } from '../../router';
@Component({
  components: {
    CanvasLobbyCreateRoomDialog,
  },
  apollo: {
    publicRooms: {
      query: gql`
        query publicRooms {
          roomsPublic {
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
      fetchPolicy: 'network-only',
      update(query: schema.Query) {
        return query.roomsPublic;
      },
    },
  },
})
export default class CanvasLobby extends Vue {
  private publicRooms: schema.Room[] = [];

  private getRoomRoute = getCanvasRoomRoute;
}
</script>
