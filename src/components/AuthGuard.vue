<template>
  <div class="auth-guard fill-parent-height">
    <transition name="component-fade" mode="out-in">
      <div class="auth-guard-overlay green-bg" v-if="!isReady">
        <v-container fluid fill-height>
          <v-row justify="center">
            <v-col align="center">
              <img src="@/assets/logo_full.png" class="mb-12" />
              <v-progress-linear
                style="width: 300px"
                height="13"
                indeterminate
                color="#F2F1DC"
              ></v-progress-linear>
              <div style="color: #f2f1dc" class="mt-5">{{ stateString }}</div>
              <div class="mt-12 mb-12" />
            </v-col>
            <br />
          </v-row>
        </v-container>
      </div>
    </transition>
    <slot v-if="isReady" name="default"> </slot>
    <slot v-if="hasError" name="error">
      <div
        style="
          bottom: -4px;
          right: 14px;
          position: absolute;
          z-index: 10000;
          max-width: 100%;
          width: 500px;
        "
        align="center"
      >
        <v-alert color="rgba(255,0,0,0.3)" type="error" align="left">
          {{ errorMessage }}
          <a
            style="color: white !important; text-decoration: underline"
            class="ml-2"
            @click="reload"
            >Click to Retry</a
          >
        </v-alert>
      </div>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import meQuery from '@/gql/me.gql';
import { schema } from '@/gql';
import gql from 'graphql-tag';

@Component
export default class AuthGuard extends Vue {
  private isReady = false;

  private hasError = false;

  private errorMessage = 'Error!';

  private stateString = 'Welcome';

  private async mounted() {
    this.$auth.initialize();
    this.$auth.on('login', async () => {
      this.guardAauth();
    });

    this.$auth.on('logout', async () => {
      this.guardAauth();
    });
  }

  private reload() {
    this.$auth.signOut();
    window.location.reload();
  }

  private async guardAauth(): Promise<void> {
    this.isReady = false;
    this.$io.disconnect();
    try {
      const clientVersionQuery = await this.$apollo.query<schema.Query>({
        query: gql`
          query clientVersion {
            clientVersion
          }
        `,
      });

      if (clientVersionQuery.data.clientVersion !== this.$app.version) {
        this.stateString = 'Uh oh! Invalid client version';
        throw new Error('Invalid client version');
      }

      this.stateString = 'Checking Authorization...';
      await this.$auth.awaitInit();

      if (this.$auth.isAuthorized) {
        this.stateString = 'Loading User Account...';
        const query = await this.$apollo.query<schema.Query>({
          query: meQuery,
          fetchPolicy: 'network-only',
        });
        this.$auth.userId = query.data.me.id;
      }

      // await new Promise((r) => setTimeout(r, 300));
      this.stateString = 'Connecting to socket...';
      this.$io.connect(this.$auth.token as string, this.$app.version);

      while (!this.$io.isConnected) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.stateString = 'Authorizing Socket...';

      if (this.$auth.isAuthorized) {
        while (!this.$io.isAuthorized) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(this.$io.isAuthorized);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isReady = true;
    } catch (err) {
      this.errorMessage = `${err}`;
      this.hasError = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-guard {
  &.--hidden {
    display: none;
  }

  .auth-guard-overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 10000;
    top: 0;
  }

  .component-fade-enter-active,
  .component-fade-leave-active {
    transition: opacity 0.8s ease;
  }
  .component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
</style>
