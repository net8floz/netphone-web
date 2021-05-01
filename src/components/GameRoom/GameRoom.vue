<template>
  <div class="d-flex align-start justify-center pt-6" v-if="!!room">
    <v-card tile>
      <div class="d-flex flex-row">
        <div class="d-flex flex-column">
          <div class="d-flex pa-4">
            <div class="d-flex">
              <v-btn :to="homeRoute" icon>
                <v-icon>mdi-arrow-left-circle</v-icon>
              </v-btn>
              <div class="d-flex flex-column ml-2">
                <div>{{ room.name }} | {{ room.gameType }}</div>
                <div>
                  <v-tooltip color="success" top v-model="linkCopied">
                    <template v-slot:activator="{ attrs }">
                      <v-btn :attrs="attrs" x-small @click="copyRoomLink"
                        >Copy Link</v-btn
                      >
                    </template>
                    <span>Link copied to clipboard!</span>
                  </v-tooltip>
                  <v-btn x-small class="ml-1" @click="killRoom">
                    Kill Game
                  </v-btn>
                </div>
              </div>
            </div>
            <v-spacer />
            <v-btn text>Help</v-btn>
          </div>
          <v-divider />
          <div class="d-flex">
            <slot name="default" />
          </div>
        </div>
      </div>
      <v-divider />
      <div class="ma-4">
        <div class="title">Logs</div>
        <div class="logs d-flex">
          <game-log />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getRoute } from '@/router';
import { schema } from '@/gql';
import GameLog from '@/components/GameLog.vue';
import gql from 'graphql-tag';

@Component({
  components: {
    GameLog,
  },
})
export default class GameRoom extends Vue {
  @Prop(Object) room!: schema.Room;

  private isKillingRoom = false;

  private linkCopied = false;

  private get homeRoute() {
    return getRoute('home');
  }

  private copyRoomLink() {
    if (this.linkCopied) {
      return;
    }
    navigator.clipboard.writeText(
      process.env.VUE_APP_SELF_ENDPOINT + '/rooms/' + this.room.id
    );
    this.linkCopied = true;
    setTimeout(() => {
      if (this) {
        this.linkCopied = false;
      }
    }, 2000);
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
}
</script>

<style lang="scss">
.logs {
  height: 300px;
  margin: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
}
</style>
