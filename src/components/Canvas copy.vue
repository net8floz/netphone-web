<template>
  <div id="draw">
    <!-- <div class="welcome-bg" v-if="popups.showWelcome">
      <div class="welcome">
        <h1 class="fade-up">Vue JS draw</h1>
        <h2 class="fade-up">By Lewi Hussey</h2>
        <a
          href="//twitter.com/lewitje"
          target="blank"
          title="Lewi Hussey on Twitter"
          class="fade-up"
          >@lewitje</a
        >
        <span
          class="btn fade-up"
          title="Close"
          v-on:click="popups.showWelcome = false"
        >
          Lets go
        </span>
      </div>
    </div> -->
    <div class="app-wrapper">
      <canvas ref="canvas" id="canvas"> </canvas>
      <div class="cursor" id="cursor"></div>
      <!-- <div class="controls">
        <div class="btn-row">
          <div class="history" title="history">
            {{ history.length }}
          </div>
        </div>
        <div class="btn-row">
          <button
            type="button"
            v-on:click="removeHistoryItem"
            v-bind:class="{ disabled: !history.length }"
            title="Undo"
          >
            <i class="ion ion-reply"></i>
          </button>
          <button
            type="button"
            v-on:click="removeAllHistory"
            v-bind:class="{ disabled: !history.length }"
            title="Clear all"
          >
            <i class="ion ion-trash-a"></i>
          </button>
        </div>

        <div class="btn-row">
          <button
            title="Brush options"
            v-on:click="popups.showOptions = !popups.showOptions"
          >
            <i class="ion ion-android-create"></i>
          </button>

          <div class="popup" v-if="popups.showOptions">
            <div class="popup-title">Options</div>
            <button
              title="Restrict movement vertical"
              v-on:click="
                options.restrictY = !options.restrictY;
                options.restrictX = false;
              "
              v-bind:class="{ active: options.restrictY }"
            >
              <i class="ion ion-arrow-right-c"></i>
              Restrict vertical
            </button>
            <button
              title="Restrict movement horizontal"
              v-on:click="
                options.restrictX = !options.restrictX;
                options.restrictY = false;
              "
              v-bind:class="{ active: options.restrictX }"
            >
              <i class="ion ion-arrow-up-c"></i>
              Restrict horizontal
            </button>
            <button
              type="button"
              v-on:click="simplify"
              v-bind:class="{ disabled: !history.length }"
              title="Simplify paths"
            >
              <i class="ion ion-wand"></i>
              Simplify paths
            </button>
            <button
              type="button"
              v-on:click="jumble"
              v-bind:class="{ disabled: !history.length }"
              title="Go nutz"
            >
              <i class="ion ion-shuffle"></i>
              Go nutz
            </button>
          </div>
        </div>

        <div class="btn-row">
          <button
            title="Pick a brush size"
            v-on:click="popups.showSize = !popups.showSize"
            v-bind:class="{ active: popups.showSize }"
          >
            <i class="ion ion-android-radio-button-on"></i>
            <span class="size-icon">
              {{ size }}
            </span>
          </button>

          <div class="popup" v-if="popups.showSize">
            <div class="popup-title">Brush size</div>
            <label v-for="(sizeItem, i) in sizes" class="size-item" :key="i">
              <input
                type="radio"
                name="size"
                v-model="size"
                v-bind:value="sizeItem"
              />
              <span
                class="size"
                v-bind:style="{
                  width: sizeItem + 'px',
                  height: sizeItem + 'px',
                }"
                v-on:click="popups.showSize = !popups.showSize"
              ></span>
            </label>
          </div>
        </div>

        <div class="btn-row">
          <button
            title="Pick a color"
            v-on:click="popups.showColor = !popups.showColor"
            v-bind:class="{ active: popups.showColor }"
          >
            <i class="ion ion-android-color-palette"></i>
            <span class="color-icon" v-bind:style="{ backgroundColor: color }">
            </span>
          </button>

          <div class="popup" v-if="popups.showColor">
            <div class="popup-title">Brush color</div>
            <label v-for="(colorItem, i) in colors" class="color-item" :key="i">
              <input
                type="radio"
                name="color"
                v-model="color"
                v-bind:value="colorItem"
              />
              <span
                v-bind:class="'color color-' + colorItem"
                v-bind:style="{ backgroundColor: colorItem }"
                v-on:click="popups.showColor = !popups.showColor"
              ></span>
            </label>
          </div>
        </div>

        <div class="btn-row">
          <button title="Save" v-on:click="popups.showSave = !popups.showSave">
            <i class="ion ion-android-cloud-outline"></i>
          </button>

          <div class="popup" v-if="popups.showSave">
            <div class="popup-title">Save your design</div>
            <div class="form">
              <input type="text" placeholder="Save name" v-model="save.name" />
              <div v-if="save.name.length < 3" class="text-faded">
                <i> Min 3 characters </i>
              </div>
              <span class="btn" v-on:click="saveItem">
                Save as
                <span class="text-faded">
                  {{ save.name }}
                </span>
              </span>
            </div>

            <div class="saves" v-if="save.saveItems.length">
              <div class="popup-title">Load a save</div>

              <div
                class="save-item"
                v-for="(item, i) in save.saveItems"
                :key="i"
              >
                <h3>{{ item.name }}</h3>
                <span class="btn" v-on:click="loadSave(item)">load</span>
              </div>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button v-on:click="popups.showWelcome = true" title="Made by Lewi">
            <i class="ion ion-heart"></i>
          </button>
        </div>
      </div> -->
    </div>
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

  private ref: HTMLCanvasElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

  private mounted() {
    const ref = this.$refs.canvas as HTMLCanvasElement;
    if (this.ref !== ref) {
      this.ref = ref;
    }
    if (this.ref) {
      this.listen();
    }
  }

  public listen() {
    if (!this.ref) return;

    this.ctx = this.ref.getContext('2d');
    this.setSize();
    this.redraw();

    this.ref.addEventListener('mousedown', (e: any) => {
      this.mouseDown = true;
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
      this.setDummyPoint();
    });

    this.ref.addEventListener('mouseup', () => {
      if (this.mouseDown) {
        this.setDummyPoint();
      }
      this.mouseDown = false;
    });

    this.ref.addEventListener('mouseleave', () => {
      if (this.mouseDown) {
        this.setDummyPoint();
      }
      this.mouseDown = false;
    });

    this.ref.addEventListener('mousemove', (e: any) => {
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
    if (!this.ref) return;
    this.ref.width = window.innerWidth;
    this.ref.height = window.innerHeight - 60;
  }

  private moveMouse(e: any): void {
    const x = e.offsetX;
    const y = e.offsetY;

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

  public redraw() {
    if (!this.ref || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.ref.width, this.ref.height);
    this.drawBgDots();

    if (!this.history.length) {
      return true;
    }

    this.history.forEach((item, i) => {
      this.draw(item, i);
    });
  }

  private drawBgDots() {
    if (!this.ctx || !this.ref) return;
    var gridSize = 50;
    this.ctx.fillStyle = 'rgba(0, 0, 0, .2)';

    for (var i = 0; i * gridSize < this.ref.width; i++) {
      for (var j = 0; j * gridSize < this.ref.height; j++) {
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

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: black;
  color: white;
}

body,
button,
input {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
}

h1,
h2,
h3,
h4,
h5 {
  font-weight: 500;
}

.text-faded {
  opacity: 0.5;
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
  height: calc(100vh - 60px);
  background-color: white;
  cursor: none;

  &:hover + .cursor {
    opacity: 1;
  }

  &:active + .cursor {
    border-color: rgb(60, 60, 60);
  }
}

.controls {
  position: fixed;
  z-index: 5;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: rgb(10, 10, 10);
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.stat {
  font-size: 20px;
  margin-bottom: 15px;
}

.btn-row {
  position: relative;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 15px;
  border-radius: 4px;
}

.popup {
  position: absolute;
  width: 300px;
  bottom: 58px;
  padding: 30px;
  left: calc(50% - 150px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: white;
  color: rgb(30, 30, 30);
  border-radius: 10px 10px 0 0;
  border: 1px solid rgb(220, 220, 220);
  border-bottom-width: 0;
  opacity: 0;
  animation: popup 0.5s forwards cubic-bezier(0.2, 2, 0.4, 1);
  z-index: 2;
  overflow: hidden;
  max-height: 80vh;
  overflow-y: auto;

  .popup-title {
    flex: 0 0 100%;
    text-align: center;
    font-size: 16px;
    color: black;
    opacity: 0.5;
    margin-bottom: 10px;
  }

  button {
    height: 80px;
    width: 80px;
    text-align: center;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.4);

    i {
      display: block;
      font-size: 30px;
      margin-bottom: 5px;
      color: rgba(0, 0, 0, 0.2);
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.2);

      i {
        color: rgba(0, 0, 0, 0.1);
      }
    }

    &.active,
    &:active {
      color: rgba(0, 0, 0, 0.4);

      i {
        color: $prim;
      }
    }
  }
}

@keyframes popup {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.welcome-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  background-color: $prim;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fade-up {
  opacity: 0;
  animation: fade-up 1s forwards cubic-bezier(0.2, 2, 0.4, 1);
}

.btn {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  font-weight: 400;
  font-size: 16px;
  border-radius: 4px;
  background-color: $prim;
  color: white;
  animation-delay: 1s;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    background-color: lighten($prim, 10%);
  }
}

.welcome {
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1.fade-up {
    font-weight: 300;
    font-size: 40px;
    animation-delay: 0.25s;
  }

  h2.fade-up {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    animation-delay: 0.5s;
  }

  a.fade-up {
    color: rgba(255, 255, 255, 0.5);
    display: inline-block;
    margin-top: 20px;
    text-decoration: none;
    animation-delay: 0.75s;
  }

  .btn.fade-up {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    margin-top: 60px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

@keyframes fade-up {
  from {
    transform: translateY(80px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

.form {
  flex: 0 0 100%;

  input {
    display: block;
    appearance: none;
    border: 0;
    box-shadow: 0;
    outline: 0;
    background-color: rgb(240, 240, 240);
    border-radius: 4px;
    padding: 10px 15px;
    width: 100%;
    margin-bottom: 4px;
  }
}

button {
  appearance: none;
  border: 0;
  border-radius: 0;
  box-shadow: 0;
  width: 40px;
  height: 60px;
  display: inline-block;
  background-color: transparent;
  color: rgb(140, 140, 140);
  font-size: 22px;
  transition: all 0.15s;
  cursor: pointer;
  outline: 0;
  position: relative;

  .size-icon,
  .color-icon {
    position: absolute;
    top: 10px;
    right: 0;
  }

  .color-icon {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .size-icon {
    font-size: 6px;
    text-align: right;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active,
  &.active {
    color: white;
  }

  &.disabled {
    color: rgb(50, 50, 50);
    cursor: not-allowed;
  }
}

.history {
  width: 30px;
  height: 30px;
  background-color: rgb(30, 30, 30);
  border-radius: 50%;
  text-align: center;
  line-height: 30px;
  font-size: 12px;
  overflow: hidden;
  color: rgb(140, 140, 140);
}

.color-item {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  input {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
  }

  input:checked + .color {
    opacity: 1;
    border: 2px solid $prim;
  }

  .color {
    display: block;
    width: 30px;
    height: 30px;
    background-color: white;
    border-radius: 50%;

    &:hover {
      opacity: 0.8;
    }
  }
}

@keyframes pulsate {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale(1.15);
  }
}

.size-item {
  width: 40px;
  height: 60px;
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  vertical-align: top;
  cursor: pointer;

  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    opacity: 0;
  }

  .size {
    background-color: rgb(140, 140, 140);
    display: inline-block;
    border-radius: 50%;
    transition: all 0.15s;
    transform: translate(-50%, -50%) scale(0.6);
    position: absolute;
    top: 50%;
    left: 50%;

    &:hover {
      opacity: 0.8;
    }
  }

  input:checked + .size {
    background-color: $prim;
  }
}

.saves {
  flex: 0 0 calc(100% + 60px);
  margin: 30px -30px -30px;
  padding: 30px;
  background-color: rgb(240, 240, 240);
  max-height: 250px;
  overflow-y: auto;

  .save-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
