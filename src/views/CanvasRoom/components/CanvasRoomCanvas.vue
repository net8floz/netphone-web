<template>
  <div ref="canvasContainer" class="canvas-container">
    <canvas ref="canvas" id="canvas" oncontextmenu="return false;"> </canvas>
    <div class="cursor" id="cursor"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import {
  DrawListCommand,
  EndStrokeDrawCommand,
  PopBrushDrawCommand,
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

  private isMouseInCanvas = false;
  private allowDrawOnEnter = false;

  private mouseDown = false;

  private canvasRef: HTMLCanvasElement | null = null;

  private canvasContainerRef: HTMLDivElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

  private cursor = -1;

  private localCursor = -1;

  private tick: number | undefined = undefined;

  public getCursor(): number {
    return this.cursor;
  }

  public acceptServerCommand(command: DrawListCommand): void {
    if (command.cursor === this.cursor + 1) {
      this.cursor = command.cursor;
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
        unmanagedData.unsentDrawlist.slice(
          0,
          Math.min(100, unmanagedData.unsentDrawlist.length)
        )
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, 100) as any;

    this.canvasRef.addEventListener('mousedown', (e) => {
      if (this.isMouseInCanvas) {
        this.mouseDown = true;
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
          new StrokeDrawCommand({ stroke: { x: e.offsetX, y: e.offsetY } })
        );
      }
    });

    this.canvasRef.addEventListener('mouseup', (e) => {
      this.allowDrawOnEnter = false;
      if (this.mouseDown && this.isMouseInCanvas) {
        this.addToDrawList(
          new EndStrokeDrawCommand({ stroke: { x: e.offsetX, y: e.offsetY } })
        );

        this.addToDrawList(new PopBrushDrawCommand());
      }
      this.mouseDown = false;
    });

    this.canvasRef.addEventListener('mouseleave', (e) => {
      this.isMouseInCanvas = false;
      if (this.mouseDown) {
        this.allowDrawOnEnter = true;
        this.mouseDown = false;
        this.addToDrawList(
          new EndStrokeDrawCommand({ stroke: { x: e.offsetX, y: e.offsetY } })
        );

        this.addToDrawList(new PopBrushDrawCommand());
      }
    });

    this.canvasRef.addEventListener('mouseenter', (e) => {
      this.allowDrawOnEnter = false;
      this.isMouseInCanvas = true;
      if (this.allowDrawOnEnter && e.buttons > 0) {
        this.mouseDown = true;
        this.addToDrawList(
          new PushBrushDrawCommand({
            color: this.color1,
            thickness: this.thickness,
          })
        );

        this.addToDrawList(
          new StrokeDrawCommand({ stroke: { x: e.offsetX, y: e.offsetY } })
        );
      }
    });

    this.canvasRef.addEventListener('mousemove', (e) => {
      if (!this.canvasRef) return;

      this.updateCursor(e.x, e.y);

      if (this.mouseDown && this.isMouseInCanvas) {
        this.addToDrawList(
          new StrokeDrawCommand({ stroke: { x: e.offsetX, y: e.offsetY } })
        );
      }
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
      if (!this.$auth.isAuthorized) {
        return;
      }
      // localCursor starts as -1, so make it zero first
      this.localCursor++;
      command.socketUserId = this.$io.socketUserId;
      command.localCursor = this.localCursor;
    }
    if (isLocal) {
      unmanagedData.drawlist.push(command);
    }
    if (
      isLocal ||
      (!isLocal && command.socketUserId !== this.$io.socketUserId)
    ) {
      userStack.commands.push(command);
      this.drawCommand(command);
    }

    if (isLocal) {
      unmanagedData.unsentDrawlist.push(command);
    } else {
      const index = unmanagedData.unsentDrawlist.findIndex(
        (i) => i.localCursor === command.localCursor
      );
      if (index >= 0) {
        unmanagedData.unsentDrawlist.splice(index, 1);
      }
    }
  }

  public remoteAddToDrawList(command: DrawListCommand): void {
    if (command.socketUserId === this.$io.socketUserId) {
      // todo: revise cursors
      if (command.localCursor > this.localCursor) {
        this.localCursor = command.localCursor;
        this.addToDrawList(command, false);
      }
    } else {
      this.addToDrawList(command, false);
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
        brushStack: [],
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

  private updateCursor(mouseX: number, mouseY: number): void {
    const cursor = document.getElementById('cursor');
    if (cursor) {
      cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
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
$prim: rgb(0, 149, 255);

.text-faded {
  opacity: 0.5;
}

.canvas-container {
  width: 800px;
  height: 800px;
  background-color: rgba(0, 0, 0, 0.3);
  margin: auto;
}

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid rgb(30, 30, 30);
  pointer-events: none;
  user-select: none;
  mix-blend-mode: difference;
  opacity: 0;
  transition: opacity 1s;
}

canvas {
  width: 100%;
  height: 100%;
  background-color: white;
  cursor: none;

  &:hover + .cursor {
    opacity: 1;
  }

  &:active + .cursor {
    border-color: rgb(60, 60, 60);
  }
}
</style>
