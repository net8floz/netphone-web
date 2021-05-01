<template>
  <div class="canvas-palette">
    <div class="d-flex align-center mb-1">
      <v-avatar size="24" class="mr-2 ml-2">
        <img :src="paletteAuthorProfilePictureUrl" />
      </v-avatar>
      <small> {{ paletteName }}</small>
      <v-spacer />
      <v-btn @click="emitEdit" v-show="allowEdit" class="ma-0" small icon>
        <v-icon size="17">mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        v-show="allowRemove"
        class="ma-0 ml-1"
        small
        icon
        @click="emitRemove"
      >
        <v-icon size="17">mdi-close-circle</v-icon>
      </v-btn>
    </div>
    <div
      class="d-flex flex-wrap canvas-palette pa-2"
      oncontextmenu="return false;"
      v-if="colors.length > 0"
    >
      <div
        @contextmenu.self="
          (e) => {
            onColorPick(color, e);
          }
        "
        @click.prevent="
          (e) => {
            onColorPick(color, e);
          }
        "
        class="color-button flex-wrap"
        v-for="color in colors"
        :key="color.id"
        :style="`background-color: rgba(${color.r}, ${color.g}, ${color.b}, ${color.a});`"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { schema } from '@/gql';
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import colorPaletteQuery from '@/gql/colorPalette.gql';

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
    },
  },
})
export default class CanvasRoomPaletteSidebarPaletteBoxes extends Vue {
  @Prop(String) colorPaletteId!: schema.Room;

  @Prop(Boolean) allowRemove!: boolean;

  private colorPalette!: schema.ColorPalette;

  private get paletteName() {
    return this.colorPalette?.name || 'Unknown';
  }

  private get paletteAuthorName() {
    return this.colorPalette?.author?.displayName || 'Unknown';
  }

  private get paletteAuthorProfilePictureUrl() {
    return this.colorPalette?.author?.profilePictureUrl || 'Unknown';
  }

  private get colors(): schema.ColorPaletteItem[] {
    return this.colorPalette?.colors || [];
  }

  private get allowEdit(): boolean {
    if (!this.colorPalette) {
      return false;
    }
    return this.colorPalette.author.id === this.$auth.userId;
  }

  @Emit('remove')
  private emitRemove() {
    return this.colorPaletteId;
  }

  @Emit('edit')
  private emitEdit() {
    return this.colorPaletteId;
  }

  @Emit('color-pick-left-click')
  private emitColorPickLeftClick(color: schema.ColorPaletteItem) {
    return color;
  }

  @Emit('color-pick-right-click')
  private emitColorPickRightClick(color: schema.ColorPaletteItem) {
    return color;
  }

  private onColorPick(color: schema.ColorPaletteItem, e: MouseEvent) {
    if (e.button === 0) {
      this.emitColorPickLeftClick(color);
    }
    if (e.button === 2) {
      this.emitColorPickRightClick(color);
    }
  }
}
</script>

<style lang="scss" scoped>
.canvas-palette {
  .color-button {
    width: 24px;
    height: 24px;
    margin: 1px;
    border: solid thin rgba(255, 255, 255, 0.12);
    border-radius: 7px;
    transform: scale(1);
    transition: all 0.1s ease-out;

    &:hover {
      transform: scale(1.1);
      cursor: pointer;
    }
  }
}
</style>
