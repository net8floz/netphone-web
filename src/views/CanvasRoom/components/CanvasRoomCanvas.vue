<template>
  <div ref="canvasContainer" class="canvas-container">
    <v-alert type="info" v-if="!this.$auth.isAuthorized">
      You can only draw if you're logged in
      <div v-if="isDevelopment">
        DEV: Okay you can draw but it will not persist
      </div>
    </v-alert>
    <v-progress-circular
      v-if="$apollo.loading || !hasInitialLoad"
      size="64"
      width="7"
      color="white"
      class="canvas-spinner ma-3"
      indeterminate
    />
    <canvas
      :class="`canvas ${
        !$apollo.loading && hasInitialLoad
          ? 'canvas--loaded'
          : 'canvas--loading'
      }`"
      ref="canvas"
      oncontextmenu="return false;"
    >
    </canvas>
    <div
      class="cursor"
      id="cursor"
      :style="`
        padding: ${calcCursorSize}px;
        left: ${calcCursorOffset}px;
        top: ${calcCursorOffset}px;
        transform: translate(${cursorX}px, ${cursorY}px);
      `"
    ></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import {
  DrawListCommand,
  EndStrokeDrawCommand,
  PushBrushDrawCommand,
  StrokeDrawCommand,
  UserStack,
} from '..';

const unmanagedData = {
  drawlist: [] as DrawListCommand[],
  usersStacks: {} as { [userId: string]: UserStack },
  unsentDrawlist: [] as DrawListCommand[],
};

function resetUnmanagedDate() {
  unmanagedData.drawlist = [];
  unmanagedData.usersStacks = {};
  unmanagedData.unsentDrawlist = [];
}

@Component
export default class CanvasRoomCanvas extends Vue {
  @Prop(String) color1!: string;
  @Prop(String) color2!: string;
  @Prop(Number) thickness!: number;
  @Prop(Number) loadCursor!: number;

  private isPointerInCanvas = false;
  private allowDrawOnEnter = false;

  private pointerDown = false;

  private canvasRef: HTMLCanvasElement | null = null;

  private canvasContainerRef: HTMLDivElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

  private cursor = -1;
  private cursorX = 0;
  private cursorY = 0;

  private localCursor = -1;

  private tick: number | undefined = undefined;

  private commandsSent = 0;

  private unsentCommands = 0;

  private get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  public getCursor(): number {
    return this.cursor;
  }

  public get canDraw(): boolean {
    return this.hasInitialLoad && this.$auth.isAuthorized;
  }

  public get hasInitialLoad(): boolean {
    return this.cursor >= this.loadCursor;
  }

  public acceptServerCommand(command: DrawListCommand): void {
    if (command.cursor === this.cursor + 1) {
      this.cursor = command.cursor;
      if (this.cursor == this.loadCursor) {
        if (this.$io.isAuthorized) {
          this.getUserStack(this.$io.socketUserId).strokeStack = [];
          this.getUserStack(this.$io.socketUserId).commands = [];
        }
      }
      this.addToDrawList(command, false);
    }
  }

  @Emit('on-commands')
  private emitCommands(
    localCursor: number,
    cursor: number,
    commands: DrawListCommand[]
  ) {
    return {
      localCursor,
      cursor,
      commands,
    };
  }

  private mounted(): void {
    const canvasRef = this.$refs.canvas as HTMLCanvasElement | null;
    this.canvasContainerRef = this.$refs
      .canvasContainer as HTMLDivElement | null;

    if (this.canvasRef !== canvasRef) {
      this.canvasRef = canvasRef;
    } else {
      this.ctx = null;
    }

    if (this.canvasRef && this.canvasContainerRef) {
      this.ctx = this.canvasRef.getContext('2d');
      this.listen();
    }
  }

  private beforeDestroy() {
    if (this.tick !== undefined) {
      clearInterval(this.tick);
      this.tick = undefined;
    }
    resetUnmanagedDate();
  }

  private listen(): void {
    if (!this.canvasRef) return;
    resetUnmanagedDate();
    this.setSize();
    this.drawBgDots();

    this.tick = setInterval(() => {
      this.emitCommands(
        this.localCursor,
        this.cursor,
        unmanagedData.unsentDrawlist
      );
      this.unsentCommands = unmanagedData.unsentDrawlist.length;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, 500) as any;

    // pointer pressed event
    this.canvasRef.addEventListener('pointerdown', (e) => {
      if (this.isPointerInCanvas) {
        this.pointerDown = true;
        if (e.button == 0) {
          this.addToDrawList(
            new PushBrushDrawCommand({
              color: this.color1,
              thickness: this.thickness,
            })
          );
        }
        if (e.button == 2) {
          this.addToDrawList(
            new PushBrushDrawCommand({
              color: this.color2,
              thickness: this.thickness,
            })
          );
        }

        this.addToDrawList(
          new StrokeDrawCommand({
            stroke: {
              x: e.offsetX,
              y: e.offsetY,
              penPressure: this.getPenPressure(e),
            },
          })
        );
      }
    });

    // Pointer release event
    this.canvasRef.addEventListener('pointerup', (e) => {
      this.allowDrawOnEnter = false;
      if (this.pointerDown && this.isPointerInCanvas) {
        this.addToDrawList(
          new EndStrokeDrawCommand({
            stroke: {
              x: e.offsetX,
              y: e.offsetY,
              penPressure: this.getPenPressure(e),
            },
          })
        );
      }
      this.pointerDown = false;
    });

    // Pointer leave canvas event
    this.canvasRef.addEventListener('pointerleave', (e) => {
      this.isPointerInCanvas = false;
      if (this.pointerDown) {
        this.allowDrawOnEnter = true;
        this.pointerDown = false;
        this.addToDrawList(
          new EndStrokeDrawCommand({
            stroke: {
              x: e.offsetX,
              y: e.offsetY,
              penPressure: this.getPenPressure(e),
            },
          })
        );
      }
    });

    // Pointer enter canvas event
    this.canvasRef.addEventListener('pointerenter', (e) => {
      this.isPointerInCanvas = true;
      if (this.allowDrawOnEnter && e.buttons > 0) {
        this.pointerDown = true;
        this.addToDrawList(
          new PushBrushDrawCommand({
            color: this.color1,
            thickness: this.thickness,
          })
        );

        this.addToDrawList(
          new StrokeDrawCommand({
            stroke: {
              x: e.offsetX,
              y: e.offsetY,
              penPressure: this.getPenPressure(e),
            },
          })
        );
      }
      this.allowDrawOnEnter = false;
    });

    // pointer move event
    this.canvasRef.addEventListener('pointermove', (e) => {
      if (!this.canvasRef) return;

      this.updateCursor(e.x, e.y);

      if (this.pointerDown && this.isPointerInCanvas) {
        this.addToDrawList(
          new StrokeDrawCommand({
            stroke: {
              x: e.offsetX,
              y: e.offsetY,
              penPressure: this.getPenPressure(e),
            },
          })
        );
      }
    });

    // prevent touch controls from scrolling when in contact with the canvas
    this.canvasRef.addEventListener('touchmove', (e) => {
      if (!this.canvasRef) return;
      e.preventDefault();
    });

    window.addEventListener('resize', () => {
      // this.setSize();
      // for (const command of drawList) {
      //   this.drawCommand(command);
      // }
    });

    // this.$io.sendDrawlistSync(this.localCursor, this.cursor);
  }

  private addToDrawList(command: DrawListCommand, isLocal = true): void {
    const userStack = this.getUserStack(command.socketUserId);

    if (isLocal) {
      if (!this.canDraw) {
        if (process.env.NODE_ENV === 'development') {
          this.drawCommand(command);
        }
        return;
      }
      // localCursor starts as -1, so make it zero first
      this.localCursor++;
      command.socketUserId = this.$io.socketUserId;
      command.localCursor = this.localCursor;
      unmanagedData.drawlist.push(command);
      unmanagedData.unsentDrawlist.push(command);

      userStack.commands.push(command);
      this.drawCommand(command);
    } else {
      if (
        this.$auth.isAuthorized &&
        command.socketUserId === this.$io.socketUserId
      ) {
        // the command was sent back to us so stop spamming it
        const index = unmanagedData.unsentDrawlist.findIndex(
          (i) => i.localCursor === command.localCursor
        );
        if (index >= 0) {
          unmanagedData.unsentDrawlist.splice(index, 1);
        }
      } else {
        // it's someone elses command so draw it
        this.drawCommand(command);
        unmanagedData.drawlist.push(command);
      }
    }
  }

  private drawCommand(command: DrawListCommand) {
    if (this.ctx === null) {
      return;
    }
    command.draw(this.ctx, this.getUserStack(command.socketUserId));
  }

  private getUserStack(socketUserId: string): UserStack {
    if (unmanagedData.usersStacks[socketUserId] === undefined) {
      unmanagedData.usersStacks[socketUserId] = {
        socketUserId,
        brush: {
          color: '',
          thickness: 0,
        },
        strokeStack: [],
        commands: [],
      };
    }
    return unmanagedData.usersStacks[socketUserId];
  }

  private setSize(): void {
    if (!this.canvasRef || !this.canvasContainerRef) return;
    this.canvasRef.width = this.canvasContainerRef.clientWidth;
    this.canvasRef.height = this.canvasContainerRef.clientHeight;
  }

  private updateCursor(pointerX: number, pointerY: number): void {
    const cursor = document.getElementById('cursor');
    if (cursor) {
      this.cursorX = pointerX;
      this.cursorY = pointerY;
    }
  }

  private get calcCursorSize() {
    return this.thickness / 2;
  }

  private get calcCursorOffset() {
    return -(this.thickness / 2 + 3);
  }

  // get current pen pressure from pointer-event data. returns max pressure (1) when the pointer type is not pressure-sensitive
  private getPenPressure(pointerEventData: PointerEvent): number {
    if (pointerEventData.pointerType == 'pen') {
      return pointerEventData.pressure;
    } else {
      return 1;
    }
  }

  private drawBgDots(): void {
    if (!this.ctx || !this.canvasRef) return;
    var gridSize = 50;
    this.ctx.fillStyle = 'rgba(0, 0, 0, .2)';

    for (var i = 0; i * gridSize < this.canvasRef.width; i++) {
      for (var j = 0; j * gridSize < this.canvasRef.height; j++) {
        if (i > 0 && j > 0) {
          this.ctx.beginPath();
          this.ctx.rect(i * gridSize, j * gridSize, 2, 2);
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }
}

// }
</script>

<style lang="scss" scoped>
.canvas-container {
  width: 800px;
  height: 800px;
  background-color: rgba(0, 0, 0, 0.3);
  margin: auto;
  position: relative;

  .cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 0px;
    height: 0px;
    margin: 0px;
    border-radius: 50%;
    border: 3px solid rgb(30, 30, 30);
    pointer-events: none;
    user-select: none;
    mix-blend-mode: difference;
    opacity: 0;
    transition: opacity 1s;
  }
  .canvas-spinner {
    position: absolute;
    right: 0;
  }
}

canvas {
  width: 100%;
  height: 100%;
  background-color: white;
  cursor: none;

  &.canvas--loading {
    opacity: 0.6;
  }

  &:hover + .cursor {
    opacity: 1;
  }

  &:active + .cursor {
    border-color: rgb(60, 60, 60);
  }
}
</style>
