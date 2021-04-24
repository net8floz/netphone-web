<template>
  <v-dialog v-model="showDialog" width="500">
    <template v-slot:activator="{ on, attrs }">
      <slot name="default" v-bind="{ on, attrs }">
        <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on">
          Create room
        </v-btn>
      </slot>
    </template>
    <v-form ref="form" @submit.prevent="submit">
      <v-card>
        <v-card-title class="headline lighten-2">
          Create A New Room
        </v-card-title>

        <v-card-text>
          <v-text-field
            label="Room Name"
            v-model="inputName"
            placeholder="you have to name it"
            :rules="[(v) => !!v || 'Please enter name okay']"
          />
          <v-text-field
            v-if="inputHasPassword"
            label="Password"
            v-model="inputPassword"
            placeholder="these are stored in plaintext on server! dont give me your passwords"
            :rules="[(v) => !!v || 'Please enter password okay']"
          />
          <v-switch v-model="inputHasPassword" label="Has Password"></v-switch>
          <v-switch v-model="inputIsPublic" label="Is Public"></v-switch>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="isSubmitting" type="submit">
            Submit
            <v-progress-circular
              v-show="isSubmitting"
              size="20"
              class="ml-3"
              indeterminate
            />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import meQuery from '@/gql/me.gql';
import { getCanvasRoomRoute } from '@/router';
@Component
export default class CanvasLobby extends Vue {
  @Prop(Boolean)
  private value!: boolean;
  private showDialog = false;
  private inputHasPassword = false;
  private inputName = '';
  private inputPassword = '';
  private inputIsPublic = true;
  private isSubmitting = false;

  private defaultName = '';

  private async mounted() {
    const query = await this.$apollo.query<schema.Query>({
      query: meQuery,
      fetchPolicy: 'cache-first',
    });
    this.defaultName = `${query.data.me.displayName}'s Room`;
  }

  @Emit('input')
  private emitInput(showDialog: boolean) {
    return showDialog;
  }

  @Watch('showDialog')
  private onShowDialogChanged(showDialog: boolean) {
    if (this.value != showDialog) {
      this.emitInput(showDialog);
    }

    if (showDialog) {
      if (!this.inputName) {
        this.inputName = this.defaultName;
      }
    }
  }

  @Watch('value')
  private onValueChanged(value: boolean) {
    if (value != this.showDialog) {
      this.showDialog = value;
    }
  }

  private async submit() {
    if (!(this.$refs.form as any).validate()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const input: schema.RoomCreateInput = {
        name: this.inputName,
        isPublic: true,
        password: this.inputHasPassword ? this.inputPassword : '',
        ownerUserId: this.$auth.userId,
        hasPassword: this.inputHasPassword,
      };
      const mutation = await this.$apollo.mutate<schema.Mutation>({
        mutation: gql`
          mutation createRoom($input: RoomCreateInput!) {
            roomCreate(input: $input) {
              id
              isPublic
              name
            }
          }
        `,
        variables: { input },
      });
      if (!mutation.data) {
        throw new Error('No data!');
      }
      const route = getCanvasRoomRoute(mutation.data.roomCreate.id);
      this.showDialog = false;
      this.$router.push(route);
    } catch (err) {
      alert(`${err}`);
    }
    this.isSubmitting = false;
  }
}
</script>
