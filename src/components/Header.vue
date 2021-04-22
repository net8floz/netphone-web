<template>
  <v-card>
    <div class="d-flex align-start">
      <v-card-title class="d-flex flex-column">
        <router-link :to="routes.home">
          <img class="ml-2" height="64" src="@/assets/logo_small.png" />
        </router-link>
        <div
          style="color: #f2f1dc; font-size: 10px; position: absolute; top: 0"
        >
          {{ $app.version }}
        </div>
      </v-card-title>
      <v-spacer />
      <!-- <v-btn :to="routes.events" class="mr-1">Events</v-btn> -->
      <div class="mt-4">
        <gql-me v-if="$auth.isAuthorized">
          <template #default="{ me }">
            <v-btn
              :to="routes.userProfile(me.id)"
              class="mr-1"
              v-if="$auth.isAuthorized"
            >
              <div class="d-flex">
                <v-img
                  style="border-radius: 50%"
                  class="mr-1"
                  width="16"
                  height="16"
                  :src="me.profilePictureUrl"
                />
                {{ me.displayName }}
              </div>
            </v-btn>
            <v-btn class="mr-1" @click="logout"> Log Out </v-btn>
          </template>
        </gql-me>
        <v-btn class="mr-1" @click="openOAuthLogin" v-else> Log In </v-btn>
      </div>
    </div>
  </v-card>
</template>
<script lang="ts">
import { routeName } from '@/router';
import { Vue, Component } from 'vue-property-decorator';
import GqlMe from './GqlMe.vue';

@Component({
  components: { GqlMe },
})
export default class Header extends Vue {
  private get routes() {
    return {
      home: { name: routeName('home') },
      events: { name: routeName('events') },
      showcase: { name: routeName('showcase-feed') },
      userProfile: (userId: string) => ({
        name: routeName('user-profile'),
        params: { userId },
      }),
    };
  }

  private async openOAuthLogin() {
    try {
      const state = await this.$auth.openOAuthLoginWindow();
      await this.$auth.loginWithToken(state.token);
    } catch (err) {
      console.warn(`${err}`);
    }
  }

  private async logout() {
    await this.$auth.signOut();
  }
}
</script>
