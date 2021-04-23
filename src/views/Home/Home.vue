<template>
  <v-container fluid class="fill-parent-height">
    <v-row v-if="$apollo.loading">Wait</v-row>
    <v-row v-else class="fill-parent-height">
      <v-col cols="2">
        <room-details-sidebar
          @leave-room="
            () => {
              currentRoom = null;
            }
          "
          :room="currentRoom"
        />
      </v-col>
      <v-col v-if="!!currentRoom"> <canvas-parent /></v-col>
      <v-col cols-4 v-else>
        <v-card class="pa-4">
          <div class="d-flex">
            <v-card-title>Pick a room to get started</v-card-title>
            <v-spacer />
            <v-dialog v-model="showCreateRoomDialog" width="500">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on">
                  Create room
                </v-btn>
              </template>
              <v-form ref="form" @submit.prevent="submit">
                <v-card>
                  <v-card-title class="headline lighten-2">
                    Privacy Policy
                  </v-card-title>

                  <v-card-text>
                    <v-text-field
                      label="Room Name"
                      v-model="inputName"
                      placeholder="you have to name it"
                      :rules="[(v) => !!v || 'Please enter name okay']"
                    />
                    <v-text-field
                      v-if="inputHasPassword"
                      label="Password"
                      v-model="inputPassword"
                      placeholder="these are stored in plaintext on server! dont give me your passwords"
                      :rules="[(v) => !!v || 'Please enter password okay']"
                    />
                    <v-switch
                      v-model="inputHasPassword"
                      label="Has Password"
                    ></v-switch>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn :disabled="isSubmitting" type="submit">
                      Submit
                      <v-progress-circular
                        v-show="isSubmitting"
                        size="20"
                        class="ml-3"
                        indeterminate
                      />
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-dialog>
          </div>

          <v-simple-table>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
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
                  <v-btn
                    small
                    class="mt-1"
                    @click="
                      () => {
                        currentRoom = room;
                      }
                    "
                    >Join</v-btn
                  >
                </td>
              </tr>
            </tbody>
          </v-simple-table>
          <v-alert v-if="!publicRooms.length" type="info" class="ma-4">
            There are no rooms!
            <div class="mt-1">Be the first to create a room!</div>
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CanvasParent from '@/components/Canvas/CanvasParent.vue';
import RoomDetailsSidebar from '@/components/RoomDetailsSidebar.vue';
import gql from 'graphql-tag';
import { schema } from '@/gql';

@Component({
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
      update(query: schema.Query) {
        return query.roomsPublic;
      },
    },
  },
  components: {
    CanvasParent,
    RoomDetailsSidebar,
  },
})
export default class Home extends Vue {
  private publicRooms: schema.Room[] = [];

  private currentRoom: schema.Room | null = null;

  private showCreateRoomDialog = false;

  private inputHasPassword = false;
  private inputName = 'New Room';
  private inputPassword = '';
  private isSubmitting = false;

  private async submit() {
    if (!(this.$refs.form as any).validate()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const input: schema.RoomCreateInput = {
        name: this.inputName,
        isPublic: true,
        password: this.inputHasPassword ? this.inputPassword : '',
        ownerUserId: this.$auth.userId,
      };
      await this.$apollo.mutate({
        mutation: gql`
          mutation createRoom($input: RoomCreateInput!) {
            roomCreate(input: $input) {
              id
              isPublic
              name
            }
          }
        `,
        variables: { input },
      });
      this.showCreateRoomDialog = false;
    } catch (err) {
      alert(`${err}`);
    }
    this.isSubmitting = false;
  }
}
</script>
