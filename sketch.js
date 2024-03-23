let allDots = [];
let connectedLines = [];
let size = 10;
let spacing = 30;
let renderScale = 5;

class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function setup() {
  let today = new Date();
  let seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
  randomSeed(seed);
                    
  let canvas = createCanvas((size + 1) * spacing * renderScale, (size + 1) * spacing * renderScale);
  canvas.parent('sketch-container');
  
  pixelDensity(1);
  noLoop()
  
  for (let i = 0; i < size; ++i) {
    for (let j = 0; j < size; ++j) {
      allDots.push(new Dot(i * spacing + spacing, j * spacing + spacing));
    }
  }
  
  shuffle(allDots, true);
  
  connectedLines = connectAllDots();

  let button = createButton('Save Pattern');
  button.mousePressed(() => {
      saveCanvas(`kolam_${nf(today.getUTCDate(),2)}${nf(today.getUTCMonth() + 1, 2)}${today.getUTCFullYear()}`, 'png');
  });
  
  let buttonToo = createButton('Print Pattern');
  buttonToo.mousePressed(printCanvas);
  
  let secondsUntilRefresh = scheduleRefresh();
  
  let hours = Math.floor(secondsUntilRefresh / 3600);
  let minutes = Math.floor((secondsUntilRefresh % 3600) / 60);
  let seconds = secondsUntilRefresh % 60;

  createP(`Next Pattern in ${nf(hours, 2)}h:${nf(minutes, 2)}m`);
  
  createA('https://files.cargocollective.com/c989887/kolam-zine-instructions.pdf', 'Printable Zine with Instructions', '_blank');

  createP('<a href="https://creativecommons.org/licenses/by-nc/4.0/" target=_blank>CC-BY-NC</a> by Anu Reddy');
}

function draw() {
  background(255);
  
  stroke(220);
  strokeWeight(renderScale);
  for (let i = 0; i < connectedLines.length; i++) {
    let dot1 = allDots[connectedLines[i].x];
    let dot2 = allDots[connectedLines[i].y];
    line(dot1.x * renderScale, dot1.y * renderScale, dot2.x * renderScale, dot2.y * renderScale);
  }
  
  fill(0);
  for (let i = 0; i < allDots.length; i++) {
    ellipse(allDots[i].x * renderScale, allDots[i].y * renderScale, 5 * renderScale, 5 * renderScale);
  }
  
  noStroke();
  fill(127);
  textSize(36);
  textAlign(RIGHT);
  text('Kolam-a-Day by Anu Reddy', width - 20, height - 20);
  
  textAlign(LEFT);
  let today = new Date();
  text(`${nf(today.getUTCDate(),2)}${nf(today.getUTCMonth() + 1, 2)}${today.getUTCFullYear()}`, 20, height - 20);
}

function isAdjacent(dot1, dot2) {
  return (abs(dot1.x - dot2.x) === spacing && dot1.y === dot2.y) ||
         (dot1.x === dot2.x && abs(dot1.y - dot2.y) === spacing);
}

function DFS(dot, visited, lines) {
  visited.add(dot);
  for (let i = 0; i < allDots.length; i++) {
    let adjacentDot = allDots[i];
    if (!visited.has(adjacentDot) && isAdjacent(dot, adjacentDot)) {
      lines.push(createVector(allDots.indexOf(dot), allDots.indexOf(adjacentDot)));
      DFS(adjacentDot, visited, lines);
    }
  }
}

function connectAllDots() {
  let startDot = allDots[0];  // You can choose any dot as the starting point
  let visitedDots = new Set();
  let lines = [];

  DFS(startDot, visitedDots, lines);

  if (visitedDots.size !== allDots.length) {
    console.log("Not all dots are connected.");
  }

  return lines;
}

function scheduleRefresh() {
  let now = new Date();
  let nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  
  let startOfNextDayUTC = new Date(nowUTC);
  startOfNextDayUTC.setUTCDate(startOfNextDayUTC.getUTCDate() + 1);
  startOfNextDayUTC.setUTCHours(0, 0, 0, 0);
  
  let delayUntilNextDay = startOfNextDayUTC - nowUTC;
  setTimeout(() => {
    location.reload();
  }, delayUntilNextDay);
  
  return delayUntilNextDay / 1000;
}

function printCanvas() {
  let dataUrl = canvas.toDataURL('image/png');
  let printWin = window.open('', '_blank');
  
  // Calculated width for A4 at 300 DPI
  let widthInPixels = 8.3 * 300;

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Canvas</title>
      <style>
        img {
          width: ${widthInPixels}px;
          height: auto;
          page-break-inside: avoid;
        }
        @media print {
          body, img {
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" alt="Canvas Image">
    </body>
    </html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();

  setTimeout(() => {
    printWin.focus();
    printWin.print();
    printWin.close();
  }, 250);
}
