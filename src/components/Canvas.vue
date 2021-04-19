<template>
  <div ref="canvasContainer" class="canvas-container">
    <canvas ref="canvas" id="canvas"> </canvas>
    <div class="cursor" id="cursor"></div>
  </div>
</template>

<script lang="ts">
import { routeName } from '@/router';
import { Vue, Component } from 'vue-property-decorator';

type Entry = {
  x: number;
  y: number;
  isDummy: boolean;
  c: string | null;
  r: number | null;
};
type PlayerData = {
  name: string;
  collections: EntryCollection[];
};
type EntryCollection = {
  name: string;
  history: Entry[];
};

// const draw = new Draw();

@Component
export default class Canvas extends Vue {
  private history: Entry[] = [];

  private color = '#13c5f7';

  private popups = {
    showColor: false,
    showSize: false,
    showWelcome: false,
    showSave: false,
    showOptions: false,
  };

  private options = {
    restrictY: false,
    restrictX: false,
  };

  private save: PlayerData = {
    name: '',
    collections: [],
  };

  private mouseDown = false;

  private mouseX = 0;

  private mouseY = 0;

  private tempHistory: Entry[] = [];

  private size = 12;

  private colors = [
    '#d4f713',
    '#13f7ab',
    '#13f3f7',
    '#13c5f7',
    '#138cf7',
    '#1353f7',
    '#2d13f7',
    '#7513f7',
    '#a713f7',
    '#d413f7',
    '#f713e0',
    '#f71397',
    '#f7135b',
    '#f71313',
    '#f76213',
    '#f79413',
    '#f7e013',
  ];

  private sizes = [6, 12, 24, 48];

  private weights = [2, 4, 6];

  private canvasRef: HTMLCanvasElement | null = null;

  private canvasContainerRef: HTMLDivElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

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

  public listen(): void {
    if (!this.canvasRef) return;

    this.setSize();
    this.redraw();

    this.canvasRef.addEventListener('mousedown', (e) => {
      this.mouseDown = true;
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
      this.setDummyPoint();
    });

    this.canvasRef.addEventListener('mouseup', () => {
      if (this.mouseDown) {
        this.setDummyPoint();
      }
      this.mouseDown = false;
    });

    this.canvasRef.addEventListener('mouseleave', () => {
      if (this.mouseDown) {
        this.setDummyPoint();
      }
      this.mouseDown = false;
    });

    this.canvasRef.addEventListener('mousemove', (e) => {
      if (!this.canvasRef) return;
      this.moveMouse(e);

      if (this.mouseDown) {
        // this.mouseX = e.mouseX;
        // this.mouseY = e.mouseY;

        if (!this.options.restrictX) {
          this.mouseX = e.offsetX;
        }

        if (!this.options.restrictY) {
          this.mouseY = e.offsetY;
        }

        const item: Entry = {
          isDummy: false,
          x: this.mouseX,
          y: this.mouseY,
          c: this.color,
          r: this.size,
        };

        this.history.push(item);
        this.draw(item, this.history.length);
      }
    });

    window.addEventListener('resize', () => {
      this.setSize();
      this.redraw();
    });
  }

  private setSize(): void {
    if (!this.canvasRef || !this.canvasContainerRef) return;
    this.canvasRef.width = this.canvasContainerRef.clientWidth;
    this.canvasRef.height = this.canvasContainerRef.clientHeight;
  }

  private moveMouse(e: any): void {
    const x = e.x;
    const y = e.y;

    const cursor = document.getElementById('cursor');
    if (cursor) {
      cursor.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
    }
  }

  public getDummyItem(): Entry {
    const lastPoint = this.history[this.history.length - 1] || {
      x: 0,
      y: 0,
      isDummy: true,
      c: null,
      r: null,
    };

    return {
      isDummy: true,
      x: lastPoint.x,
      y: lastPoint.y,
      c: null,
      r: null,
    };
  }

  private setDummyPoint() {
    const item = this.getDummyItem();
    this.history.push(item);
    this.draw(item, this.history.length);
  }

  public redraw(): boolean {
    if (!this.canvasRef || !this.ctx) return true;
    this.ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
    this.drawBgDots();

    if (!this.history.length) {
      return true;
    }

    this.history.forEach((item, i) => {
      this.draw(item, i);
    });
    return false;
  }

  private drawBgDots() {
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

  private draw(item: Entry, i: number) {
    if (!this.ctx) return;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    var prevItem = this.history[i - 2];

    if (i < 2) {
      return false;
    }

    if (!item.isDummy && !this.history[i - 1].isDummy && !prevItem.isDummy) {
      if (item.c) {
        this.ctx.strokeStyle = item.c;
      }
      if (item.r) {
        this.ctx.lineWidth = item.r;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(prevItem.x, prevItem.y);
      this.ctx.lineTo(item.x, item.y);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (!item.isDummy) {
      if (item.c) {
        this.ctx.strokeStyle = item.c;
      }
      if (item.r) {
        this.ctx.lineWidth = item.r;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(item.x, item.y);
      this.ctx.lineTo(item.x, item.y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private removeHistoryItem() {
    this.history.splice(this.history.length - 2, 1);
    this.redraw();
  }

  private removeAllHistory() {
    this.history = [];
    this.redraw();
  }

  private simplify() {
    const simpleHistory: Entry[] = [];
    this.history.forEach((item, i) => {
      if (i % 6 !== 1 || item.isDummy) {
        simpleHistory.push(item);
      }
    });
    this.history = simpleHistory;
    this.redraw();
  }

  private jumble(): void {
    // const simpleHistory = [];
    this.history.forEach((item, i) => {
      if (item.r !== null) {
        item.r += Math.sin(i * 20) * 5;
      }
    });
    this.history = this.shuffle(this.history);
    this.redraw();
  }

  private shuffle(a: Entry[]): Entry[] {
    const b: Entry[] = [];

    a.forEach((item, i) => {
      if (!item.isDummy) {
        var l = b.length;
        var r = Math.floor(l * Math.random());
        b.splice(r, 0, item);
      }
    });

    for (var i = 0; i < b.length; i++) {
      if (i % 20 === 1) {
        b.push(this.getDummyItem());
      }
    }

    return b;
  }

  private saveItem() {
    if (this.save.name.length > 2) {
      const historyItem: EntryCollection = {
        history: this.history.slice(),
        name: this.save.name,
      };

      this.save.collections.push(historyItem);
      this.save.name = '';
    }
  }

  private loadSave(item: EntryCollection) {
    this.history = item.history.slice();
    this.redraw();
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
