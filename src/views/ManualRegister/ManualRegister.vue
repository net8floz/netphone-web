<template>
  <div />
</template>

<script lang="ts">
import { schema } from '@/gql';
import gql from 'graphql-tag';
import { Component, Vue } from 'vue-property-decorator';
import { routeName } from '../../router';

@Component
export default class ManualRegister extends Vue {
  private async mounted(): Promise<void> {
    if (!this.$auth.isAuthorized) {
      alert('Must already be logged in duh');
      this.$router.push(routeName('home'));
      return;
    }
    const email = prompt('Give me email');
    const password = prompt('Give me password');

    if (!email || !password) {
      alert('You suck');
      return this.mounted();
    }

    const input: schema.UserAttachEmailPasswordInput = {
      id: this.$auth.userId,
      email,
      password,
    };

    try {
      await this.$apollo.mutate<schema.Mutation>({
        mutation: gql`
          mutation attachEmailPassword($input: UserAttachEmailPasswordInput!) {
            userAttachEmailPassword(input: $input) {
              id
            }
          }
        `,
        variables: {
          input,
        },
      });
    } catch (err) {
      alert(`${err}`);
    }

    this.$router.push(routeName('home'));
    return;
  }
}
</script>
