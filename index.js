import { message } from "./message.js";

// width of grid cell + width of grid gap
const cellSpace = 30;
// # of cells in height
const cellsDown = 7;
// Speed in ms that track moves
const speed = 300;

// Character Mappings
const chars = {
  A: [
    [3, 4, 5],
    [2, 4],
    [1, 4],
    [2, 4],
    [3, 4, 5],
  ],
  B: [
    [1, 2, 3, 4, 5],
    [1, 3, 5],
    [1, 3, 5],
    [1, 3, 5],
    [2, 4],
  ],
  C: [
    [2, 3, 4],
    [1, 5],
    [1, 5],
    [1, 5],
    [2, 4],
  ],
  D: [
    [1, 2, 3, 4, 5],
    [1, 5],
    [1, 5],
    [1, 5],
    [2, 3, 4],
  ],
  E: [
    [1, 2, 3, 4, 5],
    [1, 3, 5],
    [1, 3, 5],
  ],
  F: [
    [1, 2, 3, 4, 5],
    [1, 3],
    [1, 3],
  ],
  G: [
    [2, 3, 4],
    [1, 5],
    [1, 3, 5],
    [1, 3, 5],
    [3, 4],
  ],
  H: [[1, 2, 3, 4, 5], [3], [3], [1, 2, 3, 4, 5]],
  I: [
    [1, 5],
    [1, 2, 3, 4, 5],
    [1, 5],
  ],
  J: [[1, 4, 5], [1, 5], [1, 2, 3, 4, 5], [1], [1]],
  K: [[1, 2, 3, 4, 5], [3], [2, 4], [1, 5]],
  L: [[1, 2, 3, 4, 5], [5], [5]],
  M: [[1, 2, 3, 4, 5], [2], [3], [2], [1, 2, 3, 4, 5]],
  N: [[1, 2, 3, 4, 5], [2], [3], [4], [1, 2, 3, 4, 5]],
  O: [
    [2, 3, 4],
    [1, 5],
    [1, 5],
    [1, 5],
    [2, 3, 4],
  ],
  P: [
    [1, 2, 3, 4, 5],
    [1, 3],
    [1, 3],
    [1, 2, 3],
  ],
  Q: [
    [2, 3, 4],
    [1, 5],
    [1, 3, 5],
    [1, 4],
    [2, 3, 5],
  ],
  R: [
    [1, 2, 3, 4, 5],
    [1, 3],
    [1, 3, 4],
    [1, 2, 3, 5],
  ],
  S: [
    [1, 2, 3, 5],
    [1, 3, 5],
    [1, 3, 5],
    [1, 3, 4, 5],
  ],
  T: [[1], [1], [1, 2, 3, 4, 5], [1], [1]],
  U: [[1, 2, 3, 4, 5], [5], [5], [5], [1, 2, 3, 4, 5]],
  V: [[1, 2], [3, 4], [5], [3, 4], [1, 2]],
  W: [[1, 2, 3, 4, 5], [4], [3], [4], [1, 2, 3, 4, 5]],
  X: [[1, 5], [2, 4], [3], [2, 4], [1, 5]],
  Y: [[1], [2], [3, 4, 5], [2], [1]],
  Z: [
    [1, 5],
    [1, 4, 5],
    [1, 3, 5],
    [1, 2, 5],
    [1, 5],
  ],
  space: [[], [], []],
  "!": [1, 2, 3, 5],
  ".": [[5]],
  "?": [[2], [1], [1, 3, 5], [2, 3]],
};

const track = document.querySelector("#track");
let width = window.innerWidth;
let height = 210;
let sqAcross = Math.floor(width / cellSpace);
let sqDown = 7;
let numSquares = sqAcross * sqDown;

//  Draw inital divs
for (let i = 0; i < numSquares; i++) {
  const newLight = document.createElement("div");
  newLight.classList.add("pixel");
  track.appendChild(newLight);
}

// Make initial column queue of each pixel colored in a given column for a char
const initColumnQueue = (phrase) => {
  const columns = [];
  const inputChars = phrase.split("");
  for (let c of inputChars) {
    if (c === " ") {
      columns.push(...chars.space);
    } else if (c.match(/[a-zA-Z]/g)) {
      columns.push(...chars[c.toUpperCase()], []);
    } else if (Object.hasOwn(chars, c)) {
      columns.push(...chars[c]);
    }
  }
  columns.push(...Array(6).fill([]));
  return columns;
};

// Create array of tuples consisting of [column #, colored cells arr]
// Input is columns queue & current output (current pixels colored)
const makeColorPositionTuples = (columnQueue, currentOutput) => {
  const shiftedColumn = columnQueue.shift();
  const newOutput = currentOutput
    .map((c) => [c[0] - 1, c[1]])
    .filter((c) => c[0] >= 0);
  newOutput.push([sqAcross - 1, shiftedColumn]);
  columnQueue.push(shiftedColumn);
  return [columnQueue, newOutput];
};

// Creates and returns array of all pixel numbers that should be colored
// colors should be an array of tuples with [column #, colored cells arr]
const createFlattenedPixelArr = (colorTuples) => {
  const coloredPixelArr = colorTuples.map((col) =>
    col[1].map((pixel) => col[0] * sqDown + pixel)
  );
  return coloredPixelArr.flat();
};

// Takes flattened array and creates new DOM fragment coloring all pixels matching numbers
// from array
const colorAndDisplayPixels = (flatColoredPixelArr) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < numSquares; i++) {
    const newPixel = document.createElement("div");
    newPixel.classList.add("pixel");
    if (flatColoredPixelArr.includes(i)) {
      newPixel.classList.add("color");
    }
    fragment.appendChild(newPixel);
  }
  track.replaceChildren(fragment);
};

// Never ending loop that moves message across screen
const loopMessage = (columnQueue, output = []) => {
  const [newColumnQueue, newOutput] = makeColorPositionTuples(
    columnQueue,
    output
  );
  const flatArr = createFlattenedPixelArr(newOutput);
  colorAndDisplayPixels(flatArr);
  setTimeout(() => loopMessage(newColumnQueue, newOutput), speed);
};

// Create queue of colored cell mappings and begin loop
const initialQueue = initColumnQueue(message);
loopMessage(initialQueue);
