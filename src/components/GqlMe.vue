<template>
  <div>
    <slot name="loading" v-if="isLoading">Loading</slot>
    <slot name="error" v-else-if="hasError"> </slot>
    <slot name="default" v-else-if="isValid" v-bind="{ me }">{{
      me.displayName
    }}</slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import meQuery from '@/gql/me.gql';
import { schema } from '@/gql';

@Component({
  apollo: {
    me: {
      query: meQuery,
      fetchPolicy: 'cache-first',
    },
  },
})
export default class GqlMe extends Vue {
  private me!: schema.User;

  private get isValid(): boolean {
    return !!this.me;
  }

  private get isLoading(): boolean {
    if (this.me && this.me.id === this.$auth.uid) {
      return false;
    }
    return this.$apollo.loading;
  }

  private get hasError(): boolean {
    if (this.isLoading) {
      return false;
    }
    return !this.isValid || !this.me;
  }
}
</script>
