<template>
  <div>
    <v-card>
      <div class="d-flex align-center mr-2">
        <v-card-title> Palettes </v-card-title>
        <v-spacer />
        <canvas-room-palette-selector-menu
          @open-editor="
            (id) => {
              editId = id;
              isEditing = true;
            }
          "
          v-model="currentPaletteIds"
        >
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </canvas-room-palette-selector-menu>
      </div>

      <canvas-room-palette-sidebar-palette-boxes
        v-for="(id, i) in currentPaletteIds"
        :key="id"
        :color-palette-id="id"
        :allow-remove="currentPaletteIds.length > 1"
        @color-pick-left-click="(color) => (brush.color1 = color.hex)"
        @color-pick-right-click="(color) => (brush.color2 = color.hex)"
        @remove="() => currentPaletteIds.splice(i, 1)"
        @edit="
          (id) => {
            editId = id;
            isEditing = true;
          }
        "
      />

      <canvas-room-palette-editor-dialog
        v-model="isEditing"
        :color-palette-id="editId"
      />
    </v-card>
    <v-card class="mt-4">
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
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { CanvasBrush } from '..';
import CanvasRoomPaletteSelectorMenu from './CanvasRoomPaletteSelectorMenu.vue';
import CanvasRoomPaletteSidebarPaletteBoxes from './CanvasRoomPaletteSidebarPaletteBoxes.vue';
import CanvasRoomPaletteEditorDialog from './CanvasRoomPaletteEditorDialog.vue';

@Component({
  components: {
    CanvasRoomPaletteSelectorMenu,
    CanvasRoomPaletteSidebarPaletteBoxes,
    CanvasRoomPaletteEditorDialog,
  },
})
export default class CanvasRoomPaletteSidebar extends Vue {
  @Prop(Object) private value!: CanvasBrush;

  private currentPaletteIds = [];

  private isEditing = false;
  private editId = '';

  private brush: CanvasBrush = {
    color1: '#000000',
    color2: '#ffffff',
    thickness: 2,
  };

  @Emit('input')
  private emitChanged(brush: CanvasBrush) {
    return brush;
  }

  @Watch('brush.color1')
  private onColor1Changed(color1: string) {
    if (this.value.color1 !== color1) {
      this.emitChanged(this.brush);
    }
  }

  @Watch('brush.color2')
  private onColor2Changed(color2: string) {
    if (this.value.color2 !== color2) {
      this.emitChanged(this.brush);
    }
  }

  @Watch('brush.thickness')
  private onThicknessChanged(thickness: number) {
    if (this.value.thickness !== thickness) {
      this.emitChanged(this.brush);
    }
  }

  @Watch('value')
  private onValueChanged(value: CanvasBrush) {
    if (this.value !== this.brush) {
      this.brush = value;
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
</style>
