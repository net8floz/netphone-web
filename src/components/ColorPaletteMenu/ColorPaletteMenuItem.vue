<template>
  <div style="width: 100%" class="list-block px-2 pt-2">
    <div class="d-flex" style="margin-bottom: -16px">
      <v-checkbox :value="paletteId" class="mt-0 pt-0 mb--5" />
      <v-avatar size="24" class="disc-avatar">
        <img :src="paletteAuthorProfilePictureUrl" />
      </v-avatar>
      <div>
        {{ paletteName }}
      </div>
      <v-spacer />
      <v-btn elevation="2" icon small v-if="allowDelete(paletteAuthorId)"
        ><v-icon size="17" nudge-left="20">mdi-close-circle</v-icon></v-btn
      >
    </div>
    <div class="d-flex flex-start colorBox-wrap">
      <div
        class="colorBox"
        v-for="color in colors"
        :key="color.id"
        :style="`background-color: ${color.hex}`"
      />
    </div>
  </div>
</template>

<!-- ---------------------------------------------------------------------------------->
<script lang="ts">
import { schema } from '@/gql';
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';
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
export default class ColorPaletteMenuItem extends Vue {
  private colorPalette!: schema.ColorPalette;
  @Prop(String) colorPaletteId!: string;

  private get paletteName() {
    return this.colorPalette?.name || 'Unknown';
  }

  private get paletteAuthorProfilePictureUrl() {
    return this.colorPalette?.author?.profilePictureUrl || 'Unknown';
  }

  private get paletteAuthorId() {
    return this.colorPalette?.author?.id || 'Unknown';
  }

  private get paletteId() {
    return this.colorPalette?.id || 'Unknown';
  }

  private get colors(): schema.ColorPaletteItem[] {
    return this.colorPalette?.colors || [];
  }

  private allowDelete(paletteAuthorId: string): boolean {
    if (!paletteAuthorId) {
      return false;
    }
    return paletteAuthorId === this.$auth.userId;
  }
}
</script>
<!-- ---------------------------------------------------------------------------------->
<style lang="scss" scoped>
.colorBox {
  width: 20px;
  height: 20px;
}

.colorBox-wrap {
  margin-left: 3px;
}

.list-block {
  border-top: 1px dotted #393939a1;
  padding-right: 5px;
  padding-bottom: 14px;
}

.disc-avatar {
  margin-right: 10px;
}
</style>
