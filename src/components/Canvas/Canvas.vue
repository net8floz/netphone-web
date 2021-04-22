<template>
  <div ref="canvasContainer" class="canvas-container">
    <canvas ref="canvas" id="canvas"> </canvas>
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
  unserilaizeDrawListCommand,
  UserStack,
} from '.';

const drawList: DrawListCommand[] = [];

const userStacks: { [userId: string]: UserStack } = {};

@Component
export default class Canvas extends Vue {
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

  @Emit()
  private emitCommand(command: DrawListCommand) {
    return command;
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

  private listen(): void {
    if (!this.canvasRef) return;

    this.setSize();
    this.drawBgDots();

    for (const command of drawList) {
      this.drawCommand(command);
    }

    this.canvasRef.addEventListener('mousedown', (e) => {
      if (this.isMouseInCanvas) {
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

    this.$io.events.on('canvas-drawlist:update', (update) => {
      if (update.commands.length === 0) {
        return;
      }
      update.commands.forEach((command) => {
        if (command.cursor > this.cursor) {
          this.cursor = command.cursor;
          this.remoteAddToDrawList(unserilaizeDrawListCommand(command));
        }
      });
    });

    this.$io.sendDrawlistSync(this.localCursor, this.cursor);
  }

  private addToDrawList(command: DrawListCommand, isLocal = true): void {
    const userStack = this.getUserStack(command.userId);
    if (isLocal) {
      if (!this.$auth.isAuthorized) {
        return;
      }
      // localCursor starts as -1, so make it zero first
      this.localCursor++;
      command.userId = this.$auth.uid;
      command.localCursor = this.localCursor;
    }
    drawList.push(command);
    userStack.commands.push(command);
    this.drawCommand(command);
    if (isLocal) {
      this.emitCommand(command);
      this.$io.sendDrawlistCommands(this.localCursor, this.cursor, [command]);
    }
  }

  public remoteAddToDrawList(command: DrawListCommand): void {
    if (command.userId === this.$auth.uid) {
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
    command.draw(this.ctx, this.getUserStack(command.userId));
  }

  private getUserStack(userId: string): UserStack {
    if (userStacks[userId] === undefined) {
      userStacks[userId] = {
        userId,
        brushStack: [],
        strokeStack: [],
        commands: [],
      };
    }
    return userStacks[userId];
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
