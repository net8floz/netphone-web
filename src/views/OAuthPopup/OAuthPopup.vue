<template>
  <v-progress-circular size="300" indeterminate />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class OAuthPopup extends Vue {
  private mounted() {
    const { state } = this.$route.query;
    localStorage.setItem('oauth_callback_state', state as string);
    window.close();
  }
}
</script>
