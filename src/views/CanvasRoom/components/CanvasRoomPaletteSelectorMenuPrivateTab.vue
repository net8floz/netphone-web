<template>
  <div>
    <div v-if="$apollo.loading">
      <div class="d-flex flex-grow align-center justify-center py-12">
        <v-progress-circular size="80" indeterminate />
      </div>
    </div>
    <div v-else-if="myPalettes.length === 0">
      <v-alert type="info" class="ma-3">
        Uh oh. There should probably be something here
      </v-alert>
    </div>
    <v-list v-else>
      <canvas-room-palette-selector-palette-boxes
        v-for="palette in myPalettes"
        v-model="currentPaletteIds"
        :key="palette.id"
        :color-palette="palette"
        :is-editable="allowDelete(palette.author.id)"
      />
    </v-list>
  </div>
</template>

<script lang="ts">
import { schema } from '@/gql';
import gql from 'graphql-tag';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import CanvasRoomPaletteSelectorPaletteBoxes from './CanvasRoomPaletteSelectorPaletteBoxes.vue';

@Component({
  components: {
    CanvasRoomPaletteSelectorPaletteBoxes,
  },
  apollo: {
    myPalettes: {
      fetchPolicy: 'network-only',
      query: gql`
        query myColorPalettes {
          me {
            id
            createdColorPalettes {
              id
              name
              isPublic
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
        }
      `,
      update(query: schema.Query) {
        return query.me.createdColorPalettes;
      },
    },
  },
})
export default class CanvasRoomPaletteSelectorMenuPrivateTab extends Vue {
  @Prop(Array) private value!: string[];
  @Prop(Boolean) private isVisible!: boolean;
  private currentPaletteIds: string[] = this.value;
  private myPalettes: schema.ColorPalette[] = [];

  private allowDelete(PaletteAuthId: string): boolean {
    if (!PaletteAuthId) {
      return false;
    }
    return PaletteAuthId === this.$auth.userId;
  }

  @Watch('value')
  private onValueChanged(value: string[]) {
    if (JSON.stringify(value) !== JSON.stringify(this.currentPaletteIds)) {
      this.currentPaletteIds.splice(0, this.currentPaletteIds.length);
      value.forEach((i) => this.currentPaletteIds.push(i));
    }
  }

  @Watch('currentPaletteIds')
  private onCurrentPaletteIdsChanged(currentPaletteIds: string[]) {
    if (JSON.stringify(currentPaletteIds) !== JSON.stringify(this.value)) {
      this.$emit('input', currentPaletteIds);
    }
  }

  @Watch('isVisible')
  private onIsVisibleChange(isVisible: boolean) {
    if (isVisible) {
      this.$apollo.queries.myPalettes.refetch();
    }
  }
}
</script>

<style lang="scss" scoped>
.colorBox {
  width: 25px;
  height: 25px;
}
</style>
