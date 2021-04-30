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
        class="pt-2 pb-2 list-block"
        v-for="palette in publicPalettes"
        :key="palette.id"

      >
        <div style="width:100%;">
          <div class="d-flex" style="margin-bottom:-16px;">
            <v-checkbox
              v-model="currentPaletteIds"
              :value="palette.id"
              class="mt-0 pt-0 mb--5"
            />
            <v-avatar size="24" class="disc-avatar">
              <img :src="palette.author.profilePictureUrl" />
            </v-avatar>
            <div>
              {{ palette.name }}
            </div>
            <v-spacer />
            <v-btn
              elevation="2"
              icon
              small
              v-if="allowDelete(palette.author.id)"
            ><v-icon size="17" nudge-left="20">mdi-close-circle</v-icon></v-btn>
          </div>
          <div class="d-flex flex-start colorBox-wrap">
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
  @Prop(Boolean) private isVisible!: boolean;

  private currentPaletteIds: string[] = this.value;
  private publicPalettes: schema.ColorPalette[] = [];

  private menu = true;
  
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
      this.$apollo.queries.publicPalettes.refetch();
    }
  }
}
</script>

<style lang="scss" scoped>
.colorBox {
    width: 20px;
    height: 20px;

}

.colorBox-wrap{
  margin-left:3px;
}

.list-block{
  border-top: 1px dotted #393939a1;
  padding-right:5px;
}

.disc-avatar{
  margin-right:10px;
}


</style>
