<template>
  <div>
    <v-card>
      <div class="d-flex align-center mr-2">
        <v-card-title> Palette </v-card-title>
        <v-spacer />
        <v-avatar size="24" class="mr-2">
          <img :src="paletteAuthorProfilePictureUrl" />
        </v-avatar>
        <small> {{ paletteName }} by {{ paletteAuthorName }} </small>
      </div>
      <div
        class="d-flex flex-wrap canvas-palette pa-2"
        oncontextmenu="return false;"
      >
        <div
          @contextmenu.self="
            (e) => {
              onPaletteColorItemClick(color.hex, e);
            }
          "
          @click.prevent="
            (e) => {
              onPaletteColorItemClick(color.hex, e);
            }
          "
          class="color-button flex-wrap"
          v-for="color in colors"
          :key="color.id"
          :style="`background-color: rgba(${color.r}, ${color.g}, ${color.b}, ${color.a});`"
        />
      </div>
    </v-card>
    <v-card>
      <v-card-title> Brush </v-card-title>
      <v-card-text>
        <v-slider
          v-model="brush.thickness"
          :min="1"
          label="Thickness"
          class="align-center"
        >
          <template v-slot:append>
            <v-text-field
              v-model="brush.thickness"
              class="mt-0 pt-0"
              type="number"
              style="width: 60px"
            ></v-text-field>
          </template>
        </v-slider>
        <div class="d-flex">
          <div
            class="brush-color"
            :style="`background-color: ${brush.color1}`"
          />
          <div
            class="brush-color"
            :style="`background-color: ${brush.color2}`"
          />
        </div>
        <!-- <v-color-picker width="200px" dot-size="10"></v-color-picker> -->
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title> Actions </v-card-title>
      <div class="d-flex pa-3 pt-0">
        <v-btn class="mr-2">Undo</v-btn>
        <v-btn class="mr-2">Redo</v-btn>
        <v-btn>Save</v-btn>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { schema } from '@/gql';
import gql from 'graphql-tag';
import { CanvasBrush } from '..';

@Component({
  apollo: {
    publicPalettes: {
      query: gql`
        query publicPalettes {
          colorPalettesPublic {
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
      update({ colorPalettesPublic }: schema.Query) {
        return colorPalettesPublic;
      },
    },
  },
})
export default class CanvasRoomPaletteSidebar extends Vue {
  @Prop(Object) private value!: CanvasBrush;

  private brush: CanvasBrush = {
    color1: '#000000',
    color2: 'ffffff',
    thickness: 2,
  };

  @Emit('input')
  private emitChanged(brush: CanvasBrush) {
    return brush;
  }

  @Watch('brush')
  private onBrushChanged(brush: CanvasBrush) {
    if (this.brush !== brush) {
      this.brush = brush;
    }
  }

  @Watch('value')
  private onValueChanged(value: CanvasBrush) {
    if (this.value !== value) {
      this.value = value;
    }
  }

  private publicPalettes: schema.ColorPalette[] = [];

  private get paletteName() {
    return this.publicPalettes.length > 0
      ? this.publicPalettes[0].name
      : 'Unknown';
  }

  private get paletteAuthorName() {
    return this.publicPalettes.length > 0
      ? this.publicPalettes[0].author.displayName
      : 'Unknown';
  }

  private get paletteAuthorProfilePictureUrl() {
    return this.publicPalettes.length > 0
      ? this.publicPalettes[0].author.profilePictureUrl
      : 'Unknown';
  }

  private get colors() {
    return this.publicPalettes.length > 0 ? this.publicPalettes[0].colors : [];
  }

  private onPaletteColorItemClick(color: string, e: MouseEvent) {
    if (e.button == 0) {
      this.brush.color1 = color;
    }
    if (e.button == 2) {
      this.brush.color2 = color;
    }
  }
}
</script>

<style lang="scss" scoped>
.brush-color {
  width: 72px;
  height: 72px;
  margin: 2px;

  &:hover {
    cursor: pointer;
  }
}

.canvas-palette {
  .color-button {
    width: 24px;
    height: 24px;
    margin: 1px;
    border: solid thin #ddd;
    border-radius: 7px;

    transition: border-radius 0.2s;

    &:hover {
      border: solid thin red;
      border-radius: 4px;
      cursor: pointer;
    }
  }
}
</style>
