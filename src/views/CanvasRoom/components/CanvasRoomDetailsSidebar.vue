<template>
  <v-card>
    <div v-if="!room">
      <v-card-subtitle>No Room!</v-card-subtitle>
    </div>
    <div v-else>
      <div class="d-flex align-start">
        <v-card-subtitle style="width: 200px">{{ room.name }} </v-card-subtitle>
        <v-spacer />
        <div class="d-flex flex-column" margin:auto style="margin: 10px">
          <v-btn small class="mx-1 my-1" @click="createInvite">
            Invite to Room
          </v-btn>
          <v-btn small class="mx-1 my-1" @click="emitLeaveRoom" :to="homeRoute">
            Leave Room
          </v-btn>
          <v-btn
            v-if="room.owner.id === this.$auth.userId"
            x-small
            class="ml-1"
            @click="killRoom"
          >
            Kill Room
          </v-btn>
        </div>
      </div>
      <v-card-text class="pb-0 mb-0">
        <div>Who's Here?</div>
      </v-card-text>

      <v-list class="mt-0 pt-0">
        <v-list-item v-for="socketUser in room.users" :key="socketUser.id">
          <v-list-item-avatar size="28" class="mr-2" v-if="!socketUser.isGuest">
            <img :src="socketUser.profilePictureUrl" />
          </v-list-item-avatar>
          <v-list-item-avatar
            v-else
            rounded
            color="primary"
            size="28"
            class="pr-1 mr-2 justify-center"
          >
            <div>G</div>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ socketUser.displayName }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>
<script lang="ts">
import { schema } from '@/gql';
import { RouteName } from '@/router';
import gql from 'graphql-tag';
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import GqlMe from '../../../components/GqlMe.vue';
import GqlUser from '../../../components/GqlUser.vue';

@Component({
  components: { GqlMe, GqlUser },
})
export default class RoomDetailsSidebar extends Vue {
  @Prop(Object) room!: schema.Room;

  private isKillingRoom = false;

  @Emit()
  private leaveRoom() {
    return;
  }

  private emitLeaveRoom() {
    this.leaveRoom();
  }

  private createInvite() {
    navigator.clipboard.writeText(
      process.env.VUE_APP_SELF_ENDPOINT + '/rooms/' + this.room.id
    );
  }

  private async killRoom() {
    this.isKillingRoom = true;
    const input: schema.RoomDeleteInput = {
      id: this.room.id,
    };
    await this.$apollo.mutate<schema.Mutation>({
      mutation: gql`
        mutation killRoom($input: RoomDeleteInput!) {
          roomDelete(input: $input)
        }
      `,
      variables: { input },
    });

    this.$router.push(this.homeRoute);
  }

  private get homeRoute(): { name: RouteName } {
    return {
      name: 'home',
    };
  }
}
</script>
