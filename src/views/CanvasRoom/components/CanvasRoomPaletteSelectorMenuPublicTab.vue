<template>
  <div>
    <div v-if="$apollo.loading">
      <div class="d-flex flex-grow align-center justify-center">
        <v-progress-circular size="80" indeterminate />
      </div>
    </div>
    <div v-else-if="publicPalettes.length === 0">
      <v-alert type="info" class="ma-3">
        Uh oh. There should probably be something here
      </v-alert>
    </div>
    <v-list v-else>
      <v-list-item
        class="pt-2 pb-2"
        v-for="palette in publicPalettes"
        :key="palette.id"
      >
        <div class="d-flex">
          <div style="width: 250px" class="d-flex">
            <v-checkbox
              v-model="currentPaletteIds"
              :value="palette.id"
              class="mt-0 pt-0"
            />
            <div>
              {{ palette.name }}
            </div>
            <v-avatar size="24" class="ml-1">
              <img :src="palette.author.profilePictureUrl" />
            </v-avatar>
          </div>
          <div class="d-flex flex-wrap">
            <div
              class="colorBox"
              v-for="color in palette.colors"
              :key="color.id"
              :style="`background-color: ${color.hex}`"
            />
          </div>
        </div>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { schema } from '@/gql';
import gql from 'graphql-tag';
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
@Component({
  apollo: {
    publicPalettes: {
      fetchPolicy: 'network-only',
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
export default class CanvasRoomPaletteSelectorMenuPublicTab extends Vue {
  @Prop(Array) private value!: string[];
  private currentPaletteIds: string[] = this.value;
  private publicPalettes: schema.ColorPalette[] = [];

  private menu = true;

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
}
</script>

<style lang="scss" scoped>
.colorBox {
  width: 25px;
  height: 25px;
}
</style>
