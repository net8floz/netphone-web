<template>
  <div class="pa-4">
    <canvas-sidebar-section title="Palette">
      <template #actions>
        <v-spacer />
        <!-- <canvas-room-palette-selector-menu
          @open-editor="
            (id) => {
              editId = id;
              isEditing = true;
            }
          "
        >
          <template #activator="{ on }">
            <v-btn small icon v-on="on">
              <v-icon size="15">mdi-cogs</v-icon>
            </v-btn>
          </template>
        </canvas-room-palette-selector-menu> -->
      </template>
      <div v-if="isLoading" class="d-flex flex-grow-1">
        <v-skeleton-loader
          style="width: 100%"
          min-height="200"
          type="list-item-avatar-three-line, list-item-two-line"
        ></v-skeleton-loader>
      </div>
      <div v-else>
        <canvas-game-room-sidebar-palette-boxes
          v-for="(id, i) in currentPalettes"
          :key="`${id}-${i}`"
          :color-palette-id="id"
          :allow-remove="currentPalettes.length > 1"
          @edit="
            (id) => {
              editId = id;
              isEditing = true;
            }
          "
        />
      </div>
    </canvas-sidebar-section>
    <v-divider class="mt-2 mb-2" />
    <canvas-sidebar-section title="Brush">
      <div v-if="isLoading" class="d-flex flex-grow-1">
        <v-skeleton-loader
          style="width: 100%"
          min-height="200"
          type="list-item-avatar-three-line, image, list-item-two-line"
        ></v-skeleton-loader>
      </div>
    </canvas-sidebar-section>
    <canvas-sidebar-section title="Brush">
      <div v-if="isLoading" class="d-flex flex-grow-1">
        <v-skeleton-loader
          style="width: 100%"
          min-height="200"
          type="list-item-avatar-three-line, image, list-item-two-line"
        ></v-skeleton-loader>
      </div>
      <div v-else class="d-flex flex-grow-1 flex-column">
        <div class="d-flex align-start">
          <v-slider
            v-model="input.brushThickness"
            :min="1"
            label="Thickness"
            class="align-start"
          >
            <template v-slot:append>
              <v-btn icon small>
                <v-icon small>mdi-select-place</v-icon>
              </v-btn>
              <!-- <v-text-field
                v-model="input.brushThickness"
                class="mt-0 pt-0"
                type="number"
                style="width: 60px"
              ></v-text-field> -->
            </template>
          </v-slider>
        </div>
        <div class="d-flex flex-column">
          <!-- <div
            class="brush-color"
            :style="`background-color: ${myCanvasProfile.color1}`"
          />
          <div
            class="brush-color"
            :style="`background-color: ${myCanvasProfile.color2}`"
          /> -->
          <v-color-picker v-model="input.brushColor" width="250px" />
        </div>
      </div>
    </canvas-sidebar-section>
    <!-- <v-card v-if="false">
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
          v-model="localCurrentPaletteIds"
        >
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </canvas-room-palette-selector-menu>
      </div>

      <canvas-room-palette-sidebar-palette-boxes
        v-for="(id, i) in localCurrentPaletteIds"
        :key="id"
        :color-palette-id="id"
        :allow-remove="localCurrentPaletteIds.length > 1"
        @color-pick-left-click="(color) => (brush.color1 = color.hex)"
        @color-pick-right-click="(color) => (brush.color2 = color.hex)"
        @remove="() => localCurrentPaletteIds.splice(i, 1)"
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
        </div> -->
    <!-- <v-color-picker width="200px" dot-size="10"></v-color-picker> -->
    <!-- </v-card-text>
    </v-card> -->
  </div>
</template>

<script lang="ts">
import gql from 'graphql-tag';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
// import CanvasRoomPaletteSelectorMenu from './CanvasRoomPaletteSelectorMenu.vue';
import CanvasGameRoomSidebarPaletteBoxes from './CanvasGameRoomSidebarPaletteBoxes.vue';
// import CanvasRoomPaletteEditorDialog from './CanvasRoomPaletteEditorDialog.vue';
import CanvasSidebarSection from '@/components/CanvasGameRoomSidebarSection.vue';
import myCanvasProfileQuery from '@/gql/myCanvasProfile.gql';

import { schema } from '@/gql';

@Component({
  components: {
    // CanvasRoomPaletteSelectorMenu,
    // CanvasRoomPaletteSidebarPaletteBoxes,
    // CanvasRoomPaletteEditorDialog,
    CanvasGameRoomSidebarPaletteBoxes,
    CanvasSidebarSection,
  },
  apollo: {
    myCanvasProfile: {
      query: myCanvasProfileQuery,
      skip() {
        return !this.$auth.isAuthorized;
      },
      update(query: schema.Query) {
        console.log('Update');
        return query?.me?.canvasProfile;
      },
    },
  },
})
export default class CanvasGameRoomPaletteSidebar extends Vue {
  private isEditing = false;
  private editId = '';
  private myCanvasProfile!: schema.UserCanvasProfile;

  private input = {
    brushThickness: 4,
    brushColor: '#000000',
  };

  private get isLoading() {
    return this.$apollo.loading;
  }

  private get currentPalettes() {
    return this.myCanvasProfile?.openColorPaletteIds || [];
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
