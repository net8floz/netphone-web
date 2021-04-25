<template>
  <v-dialog v-model="showDialog" width="500">
    <template>
      <slot name="default">
        <span />
      </slot>
      <v-card width="600" v-if="!!colorPalette">
        <v-card-title class="headline lighten-2">
          Editing Palette {{ colorPaletteName }}
        </v-card-title>
        <div class="pa-4" v-if="colorPalette.author.id !== this.$auth.userId">
          <v-alert type="error">
            You do not have permission to edit this palette</v-alert
          >
        </div>
        <div class="d-flex">
          <div style="width: 300px">
            <v-card-text>
              <v-color-picker
                @update:color="onColorChange"
                v-model="selectedColor"
                @
                style="width: 100%"
              />
            </v-card-text>
          </div>
          <div>
            <v-form @submit.prevent="() => {}">
              <v-text-field
                :disabled="isSubmittingName"
                v-model="colorPalette.name"
                @blur="onTextBlur"
              />
              <v-checkbox
                class="mt-0 pt-0"
                v-model="colorPalette.isPublic"
                label="Is Public"
                @change="onPublicChange"
                :disabled="isMakingPublic"
              />
            </v-form>
            <div class="d-flex flex-wrap">
              <div
                v-for="color in colorPalette.colors"
                :key="color.id"
                :class="`box-color ${
                  color.id === selectedColorId ? 'selected' : ''
                }`"
                @click="selectedColorId = color.id"
              >
                <div
                  :style="`background-color:rgba(${color.r},${color.g},${color.b},${color.a}`"
                />
              </div>
              <div
                @click="addColor"
                class="box-color box-color--add d-flex align-center justify-center"
              >
                <v-icon color="#f2f1dc"> mdi-plus-circle </v-icon>
                <v-progress-circular
                  color="#f2f1dc"
                  v-show="isAddingColor"
                  indeterminate
                />
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { schema } from '@/gql';
import colorPaletteQuery from '@/gql/colorPalette.gql';

type ColorRGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type PendingColorChange = {
  colorPaletteId: string;
  colorId: string;
  color: ColorRGBA;
};

@Component({
  apollo: {
    colorPalette: {
      query: colorPaletteQuery,
      skip() {
        return !this.colorPaletteId;
      },
      fetchPolicy: 'cache-and-network',
      variables(): schema.QueryColorPaletteArgs {
        return {
          id: this.colorPaletteId,
        };
      },
      update(query: schema.Query) {
        if (query.colorPalette && !this.originalColorPaletteName) {
          this.originalColorPaletteName = query.colorPalette.name;
        }
        return query.colorPalette;
      },
    },
  },
})
export default class CanvasRoomPaletteEditorDialog extends Vue {
  @Prop() private colorPaletteId!: string;
  @Prop() private value!: boolean;

  private colorPalette!: schema.ColorPalette;

  private defaultName = '';

  private showDialog = this.value;

  private originalColorPaletteName = '';

  private isSubmittingName = false;

  private colorSize = 32;

  private selectedColorId = '';

  private timeout: number | undefined = 0;

  private pendingColorChanges: PendingColorChange[] = [];

  private isAddingColor = false;

  private isMakingPublic = false;

  private get selectedColor(): ColorRGBA {
    let color = this.colorPalette.colors.find(
      (color) => color.id === this.selectedColorId
    );
    if (!color && this.colorPalette.colors.length > 0) {
      color = this.colorPalette.colors[0];
    }
    if (!color) {
      return {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      };
    }
    return {
      r: color.r,
      g: color.g,
      b: color.b,
      a: color.a,
    };
  }

  private set selectedColor(newColor: ColorRGBA) {
    let color = this.colorPalette.colors.find(
      (color) => color.id === this.selectedColorId
    );
    if (!color && this.colorPalette.colors.length > 0) {
      color = this.colorPalette.colors[0];
    }
    if (!color) {
      return;
    }
    color.r = newColor.r;
    color.g = newColor.g;
    color.b = newColor.b;
    color.a = newColor.a;
  }

  private async onPublicChange() {
    if (this.isMakingPublic) {
      return;
    }
    this.isMakingPublic = true;
    try {
      const input: schema.ColorPaletteSetIsPublicInput = {
        id: this.colorPaletteId,
        isPublic: this.colorPalette.isPublic,
      };
      await this.$apollo.mutate({
        mutation: gql`
          mutation setColorPaletteIsPublic(
            $input: ColorPaletteSetIsPublicInput!
          ) {
            colorPaletteSetIsPublic(input: $input) {
              id
              isPublic
            }
          }
        `,
        variables: { input },
      });
    } catch (err) {
      alert(`${err}`);
    }
    this.isMakingPublic = false;
    await this.$apollo.queries.colorPalette.refetch();
  }

  @Watch('showDialog')
  private onShowDialogChanged(showDialog: boolean) {
    if (this.value != showDialog) {
      this.$emit('input', showDialog);
    }
  }

  @Watch('value')
  private onValueChanged(value: boolean) {
    if (value != this.showDialog) {
      this.showDialog = value;
    }
  }

  @Watch('colorPaletteId')
  private onColorPaletteIdChanged() {
    this.originalColorPaletteName = '';
  }

  private get colorPaletteName() {
    return this.colorPalette.name;
  }

  private onColorChange(val: { rgba: ColorRGBA }) {
    const color = val.rgba;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.pendingColorChanges.push({
      colorPaletteId: this.colorPaletteId,
      colorId: this.selectedColorId,
      color,
    });
    this.timeout = setTimeout(async () => {
      const unique: PendingColorChange[] = [];
      for (let i = this.pendingColorChanges.length - 1; i >= 0; i--) {
        const color = this.pendingColorChanges[i];
        if (
          unique.findIndex(
            (uniqueColor) =>
              uniqueColor.colorId === color.colorId &&
              uniqueColor.colorPaletteId === color.colorPaletteId
          ) >= 0
        ) {
          continue;
        }
        unique.push(color);
      }

      await Promise.all(
        unique.map((i) => {
          const input: schema.ColorPaletteSetColorInput = {
            colorPaletteId: i.colorPaletteId,
            colorId: i.colorId,
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a,
          };

          return this.$apollo.mutate({
            mutation: gql`
              mutation setColor($input: ColorPaletteSetColorInput!) {
                colorPaletteSetColor(input: $input) {
                  id
                  colors {
                    id
                    r
                    g
                    b
                    a
                    hex
                  }
                }
              }
            `,
            variables: {
              input,
            },
          });
        })
      );
    }, 500) as any;
  }

  private async addColor() {
    if (this.isAddingColor) {
      return;
    }
    this.isAddingColor = true;
    try {
      const input: schema.ColorPaletteItemAddInput = {
        colorPaletteId: this.colorPaletteId,
        colors: [
          {
            name: 'newColor',
            hex: '#ffffff',
          },
        ],
      };
      await this.$apollo.mutate<schema.Mutation>({
        mutation: gql`
          mutation addNewColor($input: ColorPaletteItemAddInput!) {
            colorPaletteAddColor(input: $input) {
              id
              colors {
                id
                r
                g
                b
                a
                hex
              }
            }
          }
        `,
        variables: {
          input,
        },
      });

      // this.colorPalette.colors = results.data?.colorPaletteSetColor.colors as any;
      await this.$apollo.queries.colorPalette.refetch();
    } catch (err) {
      alert(`${err}`);
    }

    await new Promise((r) => setTimeout(r, 500));
    this.isAddingColor = false;
  }

  private async onTextBlur() {
    if (this.isSubmittingName) {
      return;
    }
    if (!this.colorPalette.name) {
      this.colorPalette.name = this.originalColorPaletteName;
      return;
    }

    if (this.originalColorPaletteName === this.colorPalette.name) {
      return;
    }

    this.isSubmittingName = true;

    const input: schema.ColorPaletteSetNameInput = {
      id: this.colorPaletteId,
      name: this.colorPalette.name,
    };
    try {
      await this.$apollo.mutate({
        mutation: gql`
          mutation setColorPaletteName($input: ColorPaletteSetNameInput!) {
            colorPaletteSetName(input: $input) {
              id
              name
            }
          }
        `,
        variables: {
          input,
        },
      });
      this.originalColorPaletteName = this.colorPalette.name;
    } catch (err) {
      alert(`${err}`);
      this.colorPalette.name = this.originalColorPaletteName;
    }
    this.isSubmittingName = false;
  }
}
</script>

<style lang="scss" scoped>
.box-color {
  margin: 3px;

  // border: solid 1px white;
  z-index: 100;
  width: 32px;
  height: 32px;
  background-color: white;
  position: relative;

  &.box-color--add {
    background-color: rgba(0, 0, 0, 0.3);
  }

  > div {
    position: absolute;
    content: '';
    width: 32px;
    height: 32px;
    // background-color: white;
    // z-index: -1;
  }

  &.selected {
    border: solid 4px black;
    > div {
      border: solid 3px white;
      left: -2px;
      top: -2px;
    }
  }

  &:hover {
    cursor: pointer;
    border: solid 4px black;
    > div {
      border: solid 3px white;
      left: -2px;
      top: -2px;
    }
  }
}
</style>
