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

    <v-card width="500">
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon size="50">mdi-palette</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>Choose a Palette</v-list-item-title>
            <v-list-item-subtitle>
              Manage and browse palettes
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

      <div style="height: 300px; overflow-y: scroll">
        <color-palette-menu-item
          v-for="palette in allPalettes"
          :key="palette.id"
          :colorPaletteId="palette.id"
        />
      </div>

      <!-- <v-divider></v-divider> -->
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import ColorPaletteMenuItem from '@/components/ColorPaletteMenu/ColorPaletteMenuItem.vue';
import { schema } from '@/gql';
import gql from 'graphql-tag';

@Component({
  components: {
    ColorPaletteMenuItem,
  },
  apollo: {
    allPalettes: {
      fetchPolicy: 'cache-and-network',
      query: gql`
        query allPalettes {
          colorPalettesAll {
            id
            name
            colors {
              id
              name
              r
              g
              b
              hex
              a
            }
            author {
              id
              displayName
              profilePictureUrl
            }
          }
        }
      `,
      update(query: schema.Query) {
        return query.colorPalettesAll;
      },
    },
  },
})
export default class CanvasPaletteMenu extends Vue {
  private isCreatingPalette = false;

  private menu = true;

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
}
</script>
