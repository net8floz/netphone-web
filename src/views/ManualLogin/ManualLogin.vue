<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { routeName } from '../../router';

@Component
export default class ManualLogin extends Vue {
  private async mounted(): Promise<void> {
    const email = prompt('Give me email');
    const password = prompt('Give me password');

    if (!email || !password) {
      alert('You suck');
      return this.mounted();
    }

    try {
      await this.$auth.loginWithEmailPassword(email, password);
    } catch (err) {
      alert(`${err}`);
    }

    this.$router.push(routeName('home'));
    return;
  }
}
</script>
