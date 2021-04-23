<template>
  <v-card>
    <div v-if="!room">
      <v-card-subtitle>No Room!</v-card-subtitle>
    </div>
    <div v-else>
      <v-card-subtitle>{{ room.name }}</v-card-subtitle>
      <v-card-text class="pb-0">
        <div>Who's Here?</div>
      </v-card-text>
      <v-btn x-small class="mt-6 ml-3" @click="emitLeaveRoom">Leave Room</v-btn>
      <v-list>
        <!-- <v-list-item v-for="userId in roomDetails.users" :key="userId">
        <gql-user :id="userId" class="d-flex justify-center">
          <template #default="{ user }">
            <v-list-item-avatar size="28" class="mr-2">
              <img :src="user.profilePictureUrl" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ user.displayName }}
              </v-list-item-title>
            </v-list-item-content>
          </template>
        </gql-user>
      </v-list-item>
      <v-list-item v-for="i in roomDetails.guestCount" :key="i">
        <v-list-item-avatar
          rounded
          color="primary"
          size="28"
          class="pr-1 mr-2 justify-center"
        >
          <div>G</div>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title> Guest </v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
      </v-list>
    </div>
  </v-card>
</template>
<script lang="ts">
import { schema } from '@/gql';
import { routeName } from '@/router';
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import GqlMe from './GqlMe.vue';
import GqlUser from './GqlUser.vue';

@Component({
  components: { GqlMe, GqlUser },
})
export default class RoomDetailsSidebar extends Vue {
  @Prop(Object) room!: schema.Room | null;

  @Emit()
  private leaveRoom() {
    return;
  }

  private emitLeaveRoom() {
    this.leaveRoom();
  }
}
</script>
