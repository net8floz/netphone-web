<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    nudge-left="20"
    offset-x
    left
  >
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs, menu }">
        <v-btn color="indigo" dark v-bind="attrs" v-on="on">
          Menu as Popover
        </v-btn>
      </slot>
    </template>

    <v-card width="500" style="min-height: 300px">
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon size="50">mdi-palette</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>Choose A Palette</v-list-item-title>
            <v-list-item-subtitle>
              Manage and browser palettes
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn
              v-if="$auth.isAuthorized"
              @click="createPalette"
              :disabled="isCreatingPalette"
              color="rgba(0,0,0,0.3)"
              >Create new</v-btn
            >
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-tabs right>
        <v-tab>Public</v-tab>
        <v-tab>Private</v-tab>
        <v-tab>Recently Used</v-tab>

        <v-tab-item>
          <canvas-room-palette-selector-menu-public-tab
            v-model="currentPaletteIds"
          />
        </v-tab-item>
        <v-tab-item>
          <canvas-room-palette-selector-menu-private-tab
            v-model="currentPaletteIds"
          />
        </v-tab-item>
        <v-tab-item>
          <v-alert type="info" class="ma-3">
            You have no recently used palettes
          </v-alert>
        </v-tab-item>
      </v-tabs>

      <!-- <v-divider></v-divider> -->
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import CanvasRoomPaletteSelectorMenuPublicTab from './CanvasRoomPaletteSelectorMenuPublicTab.vue';
import CanvasRoomPaletteSelectorMenuPrivateTab from './CanvasRoomPaletteSelectorMenuPrivateTab.vue';
import { schema } from '@/gql';
import gql from 'graphql-tag';
@Component({
  components: {
    CanvasRoomPaletteSelectorMenuPublicTab,
    CanvasRoomPaletteSelectorMenuPrivateTab,
  },
})
export default class CanvasRoomPaletteSelectorMenu extends Vue {
  @Prop(Array) private value!: string[];
  private currentPaletteIds: string[] = this.value;

  private isCreatingPalette = false;

  private menu = false;

  private async createPalette() {
    if (this.isCreatingPalette) {
      return;
    }
    this.isCreatingPalette = true;
    try {
      const input: schema.ColorPaletteCreateInput = {
        name: 'New Palette',
        authorUserId: this.$auth.userId,
        colors: [
          {
            name: 'white',
            hex: '#ffffff',
          },
          {
            name: 'black',
            hex: '#000000',
          },
        ],
        isPublic: false,
      };
      const mutation = await this.$apollo.mutate<schema.Mutation>({
        mutation: gql`
          mutation createNewPalette($input: ColorPaletteCreateInput!) {
            colorPaletteCreate(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      });

      await this.$apollo.query({
        query: gql`
          query meQuery {
            me {
              id
              createdColorPalettes {
                id
                colors {
                  id
                  name
                  hex
                  r
                  g
                  b
                  a
                }
              }
            }
          }
        `,
      });

      const id = mutation.data?.colorPaletteCreate.id;
      if (!id) {
        throw new Error("Couldn't get ID");
      }
      this.emitOpenEditor(id);
      this.menu = false;
    } catch (err) {
      alert(`${err}`);
    }
    this.isCreatingPalette = false;
  }

  @Emit('open-editor')
  private emitOpenEditor(id: string) {
    return id;
  }

  @Watch('value')
  private onValueChanged(value: string[]) {
    if (JSON.stringify(value) !== JSON.stringify(this.currentPaletteIds)) {
      this.currentPaletteIds.splice(0, this.currentPaletteIds.length);
      value.forEach((i) => this.currentPaletteIds.push(i));
    }
  }

  @Watch('menu')
  private onMenuChange(menu: boolean){
    // if(menu){
    //   this.$apollo.
    // }
  }

  @Watch('currentPaletteIds')
  private onCurrentPaletteIdsChanged(currentPaletteIds: string[]) {
    if (JSON.stringify(currentPaletteIds) !== JSON.stringify(this.value)) {
      this.$emit('input', currentPaletteIds);
    }
  }
}
</script>
