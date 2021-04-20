<template>
  <div>
    <slot name="loading" v-if="isLoading">Loading</slot>
    <slot name="error" v-else-if="hasError"> </slot>
    <slot name="default" v-else-if="isValid" v-bind="{ user }">
      {{ user.displayName }}
    </slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import userQuery from '@/gql/user.gql';
import { schema } from '@/gql';

@Component({
  apollo: {
    user: {
      query: userQuery,
      fetchPolicy: 'cache-and-network',
      skip() {
        return !this.id;
      },
      variables() {
        return { id: this.id };
      },
    },
  },
})
export default class GqlUser extends Vue {
  @Prop(String) private id!: string;
  private user!: schema.User;

  private get isValid(): boolean {
    return !!this.user;
  }

  private get isLoading(): boolean {
    if (this.user && this.user.id === this.id) {
      return false;
    }
    return this.$apollo.loading;
  }

  private get hasError(): boolean {
    if (this.isLoading) {
      return false;
    }
    return !this.isValid || !this.user;
  }
}
</script>
