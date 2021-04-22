<template>
  <v-row class="canvas-parent">
    <v-col cols="9">
      <v-card class="pa-5 mb-4">
        <v-alert
          color="rgba(0,0,0,0.4)"
          type="error"
          v-if="!$auth.isAuthorized"
        >
          You are a Guest. You cannot see. You cannot Draw.
        </v-alert>
        <draw-canvas v-bind="brush" />
      </v-card>
    </v-col>
    <v-col>
      <v-card>
        <div class="d-flex align-center mr-2">
          <v-card-title> Palette </v-card-title>
          <v-spacer />
          <v-avatar size="24" class="mr-2">
            <img :src="paletteAuthorProfilePictureUrl" />
          </v-avatar>
          <small> {{ paletteName }} by {{ paletteAuthorName }} </small>
        </div>
        <div class="d-flex flex-wrap canvas-palette pa-2">
          <div
            @click="
              () => {
                brush.color1 = color.hex;
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
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { schema } from '@/gql';
import gql from 'graphql-tag';
import { Vue, Component } from 'vue-property-decorator';
import DrawCanvas from './Canvas.vue';

@Component({
  components: {
    DrawCanvas,
  },
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
export default class CanvasParent extends Vue {
  private publicPalettes: schema.ColorPalette[] = [];

  private brush = {
    thickness: 2,
    color1: '#000000',
    color2: '#ffffff',
  };

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

  private addColor() {
    //
  }
}
</script>

<style lang="scss">
.canvas-parent {
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
}
</style>
