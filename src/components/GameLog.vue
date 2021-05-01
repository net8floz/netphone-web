<template>
  <div class="game-log d-flex flex-grow-1">
    <v-virtual-scroll
      :bench="benched"
      :items="items"
      height="300"
      item-height="64"
      @scroll.native="onScroll"
      style="overflow-y: scroll"
      ref="scroll"
    >
      <template v-slot:default="{ item }">
        <v-list-item :key="item.ts">
          <v-list-item-action>
            <v-btn fab small depressed color="primary">
              <!-- {{ item.message }} -->
            </v-btn>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>
              User Database Record <strong>ID {{ item.message }}</strong>
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <!-- <v-icon small> mdi-open-in-new </v-icon> -->
          </v-list-item-action>
        </v-list-item>

        <v-divider></v-divider>
      </template>
    </v-virtual-scroll>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';

type LogItem = {
  message: string;
  ts: number;
};

@Component
export default class GameLog extends Vue {
  private benched = 0;

  private items: LogItem[] = [];

  private interval = -1;

  private scrollHeight = 0;

  @Ref('scroll') scrollEl!: Vue;

  private isAtBottom = true;

  private get length() {
    return 7000;
  }

  private async mounted() {
    // console.log(this.$refs.scroll.$el);
    this.interval = setInterval(() => {
      if (!this.scrollEl) {
        return;
      }
      if (this.scrollHeight !== this.scrollEl.$el.scrollHeight) {
        this.scrollHeight = this.scrollEl.$el.scrollHeight;
      }
      //
    }, 100) as any;

    this.addMessage('Console started!');
  }

  private beforeDestroy() {
    console.log('Clear');
    clearInterval(this.interval);
  }

  @Watch('scrollHeight')
  private onScrollHeightChanged() {
    if (!this.scrollEl) {
      return;
    }
    if (this.isAtBottom) {
      this.scrollEl.$el.scrollTop = this.scrollHeight;
    }
  }

  private onScroll(): void {
    if (!this.scrollEl) {
      return;
    }
    this.isAtBottom =
      this.scrollEl.$el.scrollTop ===
      this.scrollEl.$el.scrollHeight - this.scrollEl.$el.clientHeight;
  }

  private addMessage(message: string) {
    this.items.push({
      message,
      ts: Date.now(),
    });
  }
}
</script>

<style lang="scss" scoped>
.game-log {
  background: #626262;
}
</style>
