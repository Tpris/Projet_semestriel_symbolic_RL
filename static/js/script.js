const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const curseur = document.getElementById("dist");

canvas.width = window.innerWidth - canvas.offsetLeft;
canvas.height = window.innerHeight - 50;
canvas.style.position = "absolute";
canvas.style.top = 50 + "px";
canvas.style.left = 0 + "px";

/**
 * Draw the scale of the maximum distance between limbs 
 */
function drawLineDist() {
  ctx.beginPath();
  ctx.moveTo(10, 10);
  dist = 10 + parseInt(curseur.value);
  ctx.lineTo(dist, 10);
  ctx.stroke();
}

let win = false;
drawLineDist();

let moved = false;
let isBody = false;
let idCurrentCircle = null;
let finalCircle = null;
let selected = false;
let idCurrentMember = null;
let historyHumanPositions = [
  { hleft: null, hright: null, lleft: null, lright: null },
];
let historyCanvas = [];

let center = canvas.width / 2;
class pos {
  constructor(x, y) {
    (this.x = x), (this.y = y);
  }
}
let human = [
  new pos(center - 70, canvas.height - 120), // left hand
  new pos(center + 70, canvas.height - 120), // right hand
  new pos(center + 50, canvas.height - 20), // right foot
  new pos(center - 50, canvas.height - 20), // left foot
  new pos(center, canvas.height - 100), // body
];

let body;
/**
 * Draw the climber
 * @return the members of type Path2D
 */
function drawHuman() {
  linkMembers();
  ctx.fillStyle = "red";
  let members = [];
  for (let i = 0; i < 2; i++) {
    hand = new Path2D();
    hand.ellipse(human[i].x, human[i].y, 10, 15, 0, 0, 2 * Math.PI);
    ctx.fill(hand);
    members.push(hand);
  }
  for (let i = 2; i < 4; i++) {
    feet = new Path2D();
    feet.ellipse(human[i].x, human[i].y, 15, 10, 0, 0, 2 * Math.PI);
    ctx.fill(feet);
    members.push(feet);
  }

  // show symetry
  hand = new Path2D();
  hand.ellipse(
    human[0].x + 5,
    human[0].y + 3,
    5,
    15,
    (40 * Math.PI) / 180,
    0,
    2 * Math.PI
  );
  ctx.fill(hand);

  hand = new Path2D();
  hand.ellipse(
    human[1].x - 5,
    human[1].y + 3,
    5,
    15,
    (-40 * Math.PI) / 180,
    0,
    2 * Math.PI
    );
    ctx.fill(hand);
    
  feet = new Path2D();
  feet.ellipse(human[2].x + 16, human[2].y, 5, 8, 0, 0, 2 * Math.PI);
  ctx.fill(feet);
  
  feet = new Path2D();
  feet.ellipse(human[3].x - 16, human[3].y, 5, 8, 0, 0, 2 * Math.PI);
  ctx.fill(feet);
  
  // body
  body = new Path2D();
  body.ellipse(human[4].x, human[4].y, 25, 30, 0, 0, 2 * Math.PI);
  ctx.fill(body);
  let head = new Path2D();
  head.arc(human[4].x, human[4].y - 35, 20, 0, 2 * Math.PI);
  ctx.fill(head);
  ctx.fillStyle = "blue";
  return members;
}

/**
 * Draw the lines of the limbs
 */
function linkMembers() {
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(human[i].x, human[i].y);
    ctx.lineTo(human[4].x, human[4].y);
    ctx.stroke();
  }
}

let members = drawHuman();

let circles = [];

let jsonFileUploaded = false;
let positionsCircles = [];

/**
 * Get the handholds positions
 * @returns the wall with handholds positions
 */
function getPositionsCircles() {
  indexFinal = circles.indexOf(finalCircle);
  const wall = positionsCircles
    .map((p, index) =>
      index != indexFinal ? { x: p.x, y: canvas.height - p.y } : null
    )
    .filter((p) => p != null);

  wall.push({
    x: positionsCircles[indexFinal].x,
    y: canvas.height - positionsCircles[indexFinal].y,
  });
  return wall;
}

/**
 * Export the wall in JSON file
 */
function exportPositionFile() {
  const wall = getPositionsCircles();
  console.log(wall);
  const jsonData = JSON.stringify({ wall });

  const blob = new Blob([jsonData], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "wall.json";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a wall from JSON file
 */
function uploadPositionFile() {
  positionsCircles = [];
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const data = JSON.parse(content);
      jsonFileUploaded = true;
      const positionFile = data.wall;
      positionFile.forEach((position, index) => {
        addToPositionCircleList(position.x, canvas.height - position.y);
      });
      createWall();
      document.getElementById("deleteButton").style.display = "inline";
    };
    reader.readAsText(file);
  };
  circles[0].moveTo(0, 0);
  input.click();
}

/**
 * Remove the wall uploaded
 */
function deletePositionFile() {
  document.getElementById("deleteButton").style.display = "none";
  jsonFileUploaded = false;
  createWall();
}

/**
 * Create a wall
 */
function createWall() {
  historyCanvas = [];
  historyHumanPositions = [
    { hleft: null, hright: null, lleft: null, lright: null },
  ];
  human = [
    new pos(center - 70, canvas.height - 120),
    new pos(center + 70, canvas.height - 120),
    new pos(center + 50, canvas.height - 20),
    new pos(center - 50, canvas.height - 20),
    new pos(center, canvas.height - 100),
  ];
  if (!jsonFileUploaded) {
    positionsCircles = [];
    const numberCircles = getRandomInt(4, 10);
    for (let i = 0; i < numberCircles; i++) {
      x = getRandomInt(0, canvas.width);
      y = getRandomInt(0, canvas.height);
      positionsCircles.push(new pos(x, y));
    }
  }
  renderWall();
}

createWall();


/**
 * Crete a Path2D circle
 * @param {*} x 
 * @param {*} y 
 * @param {*} final 
 * @returns the Path2D circle
 */
function createCircle(x, y, final = false) {
  let circle = new Path2D();
  circle.arc(x, y, 10, 0, 2 * Math.PI);

  if (final) {
    finalCircle = circle;
    ctx.fillStyle = "green";
  }
  ctx.fill(circle);
  ctx.fillStyle = "blue";
  return circle;
}

function addToCircleList(circle) {
  circles.push(circle);
}

function addToPositionCircleList(x, y) {
  positionsCircles.push(new pos(x, y));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/**
 * Draw all the canvas elements
 */
function renderWall() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles = [];
  drawLineDist();
  drawCircles();
  members = drawHuman();
  document.getElementById('coord').innerHTML = 'X = '+human[4].x+' Y = '+human[4].y;
}

/**
 * Draw the handholds
 */
function drawCircles() {
  positionsCircles.forEach((position, index) => {
    final = index == positionsCircles.length - 1;
    let c = createCircle(position.x, position.y, final);
    addToCircleList(c);
  });
}

// Listen for mouse moves
canvas.addEventListener("mousedown", function (event) {
  let deleteCircle = false;
  circles.forEach((circle, index) => {
    // Check whether point is inside circle
    if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
      // If ctrl-click remove handhold
      if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
        deleteCircle = true;
        if (circle == finalCircle) {
          return;
        }
        circles.splice(index, 1);
        positionsCircles.splice(index, 1);
        renderWall();
        return;
      }

      // Get the current circle id to move
      idCurrentCircle = circles.indexOf(circle);
      moved = true;
    }
  });

  // Check if the body is going to move 
  if (ctx.isPointInPath(body, event.offsetX, event.offsetY)) {
    moved = true;
    isBody = true;
  }

  // click middle button create circle
  if (
    !deleteCircle &&
    (event.button === 1 || (event.button === 0 && event.ctrlKey))
  ) {
    positionsCircles.splice(0, 0, new pos(event.offsetX, event.offsetY));
    renderWall();
  }
});

canvas.onmousemove = function (event) {
  // Move the body
  if (isBody) {
    if (historyHumanPositions.length == 1) {
      x_gap = human[4].x - event.offsetX;
      y_gap = human[4].y - event.offsetY;
      for (let i = 0; i < 4; i++) {
        human[i].x = human[i].x - x_gap;
        human[i].y = human[i].y - y_gap;
      }
    }
    human[4].x = event.offsetX;
    human[4].y = event.offsetY;
    renderWall();
  // Move the handholds
  } else if (moved && idCurrentCircle != null) {
    positionsCircles[idCurrentCircle].x = event.offsetX;
    positionsCircles[idCurrentCircle].y = event.offsetY;
    renderWall();
  }
};

canvas.onmouseup = function (event) {
  // move come to an end
  moved = false;
  isBody = false;
};

canvas.addEventListener("click", function (event) {
  let found = false;
  // select a member to climb
  for (const m of members) {
    if (ctx.isPointInPath(m, event.offsetX, event.offsetY)) {
      selected = !selected;
      found = true;
      idCurrentMember = members.indexOf(m);
    }
  }

  // select the handhold and move the member over it
  if (!found && selected) {
    for (const circle of circles) {
      if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
        if (checkContraints(event.offsetX, event.offsetY)) {
          human[idCurrentMember].x = event.offsetX;
          human[idCurrentMember].y = event.offsetY;
          centreDeGravite();
          indCircle = circles.indexOf(circle);
          // used for to upload the path
          addToHistoryPositions(indCircle, idCurrentMember);
          addToCanvasHistory();

          if (!win && checkWin()) {
            win = true;
            renderWall();
            setTimeout(winDisplay, 1000);
          }
        }
        selected = false;
      }
    }
  }
  renderWall();
});

/**
 * Check the move constraints
 * @param {*} x position desired
 * @param {*} y position desired
 * @returns True if the move is legal
 */
function checkContraints(x, y) {
  return (
    checkDistance(x, y) && checkHandsOnTop(y) && checkLeftRightOrientation(x)
  );
}

/**
 * CHeck if the distance is under the limit
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function checkDistance(x, y) {
  const adjacent = (idCurrentMember + 2) % 4;
  const a = distanceBody(human[adjacent].x, human[adjacent].y);
  const b = distanceBody(x, y);
  return a + b < parseInt(curseur.value);
}

/**
 * Check the up/down constraint
 * @param {*} y 
 * @returns 
 */
function checkHandsOnTop(y) {
  const hand = idCurrentMember == 0 || idCurrentMember == 1;
  if (hand) {
    return y < human[2].y && y < human[3].y;
  }
  return y > human[0].y && y > human[1].y;
}

/**
 * Check the left/right constraint
 * @param {*} x 
 * @returns 
 */
function checkLeftRightOrientation(x) {
  const left = idCurrentMember == 0 || idCurrentMember == 3;
  if (left) {
    return x < human[1].x && x < human[2].x;
  }
  return x > human[0].x && x > human[3].x;
}

/**
 * Check if hands are on the final handhold
 * @returns 
 */
function checkWin() {
  let lhand = human[0];
  let rhand = human[1];
  return (
    ctx.isPointInPath(finalCircle, lhand.x, lhand.y) &&
    ctx.isPointInPath(finalCircle, rhand.x, rhand.y)
  );
}

function winDisplay() {
  alert("You win");
}
function distanceCalculation(x1, x2, y1, y2) {
  const x = x1 - x2;
  const y = y1 - y2;
  return Math.sqrt(x * x + y * y);
}

/**
 * Get the distance with the body
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function distanceBody(x, y) {
  return distanceCalculation(x, human[4].x, y, human[4].y);
}

curseur.addEventListener("change", function (e) {
  renderWall();
});


function centreSegment(x1, x2, y1, y2) {
  let xi = (x1 + x2) / 2;
  let yi = (y1 + y2) / 2;
  return [xi, yi];
}

/**
 * Calculating the centre of gravity for the body
 */
function centreDeGravite() {
  c1 = centreSegment(human[0].x, human[1].x, human[0].y, human[1].y);
  c2 = centreSegment(human[2].x, human[3].x, human[2].y, human[3].y);
  gravite = centreSegment(c1[0], c2[0], c1[1], c2[1]);
  human[4].x = gravite[0];
  human[4].y = gravite[1];
}

/**
 * Upload a path file in JSON format and apply mouvements
 */
function uploadPathFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const data = JSON.parse(content);
      const pathFile = data.path;
      let legal_move = true;
      pathFile.forEach(async (move, index) => {
        await delay(1000 * index);
        if (legal_move) {
          legal_move = moveHuman(move);
        }
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Move the climber depending on a move
 * @param {*} move 
 * @returns True if the move is done and respect constraints
 */
function moveHuman(move) {
  m = [move.hleft, move.hright, move.lright, move.lleft];

  for (let i = 0; i < 4; i++) {
    if (m[i] != null) {
      idCurrentMember = i;
      ind = m[i];
      x = positionsCircles[ind].x;
      y = positionsCircles[ind].y;
      if (true || checkContraints(x, y)) {
        if (human[i].x != x || human[i].y != y) {
          human[i].x = x;
          human[i].y = y;
          centreDeGravite();
          addToHistoryPositions(ind, idCurrentMember);
          addToCanvasHistory();
        }
      } else {
        alert("Error : illegal move");
        return false;
      }
    }
  }
  renderWall();
  return true;
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function compare(a, b) {
  if (a.y < b.y) {
    return 1;
  } else if (a.y > b.y) {
    return -1;
  }
  return 0;
}

/**
 * Export path file in JSON and download images canvas
 */
function exportPathFile() {
  path = historyHumanPositions;
  const jsonData = JSON.stringify({ path });
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "path.json";
  a.click();
  addToCanvasHistory();
  const downloadImg = confirm(
    "Voulez-vous télécharger les images du parcours ?"
  );
  if (downloadImg) {
    downloadAllCanvas();
  }
}

/**
 * Add a move done in the history
 * @param {*} idCircle 
 * @param {*} idMember 
 */
function addToHistoryPositions(idCircle, idMember) {
  nameMember = ["hleft", "hright", "lright", "lleft"];
  const last = historyHumanPositions.slice(-1)[0];
  copy = { ...last };
  copy[nameMember[idMember]] = idCircle + 1;
  historyHumanPositions.push(copy);
}

/**
 * Add the canvas image to the history
 */
function addToCanvasHistory() {
  historyCanvas.push(canvas.toDataURL());
}

/**
 * Download one image
 * @param {*} url 
 */
function exportUniqueImage(url) {
  let a = document.createElement("a");
  a.href = url;
  a.download = "img.png";
  a.click();
}

/**
 * Download each image of the canvas history
 */
function downloadAllCanvas() {
  for (c of historyCanvas) {
    exportUniqueImage(c);
  }
}

/////////////////////////////////////
//                                 //
//          URL HANDLER            //
//                                 //
/////////////////////////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Apply GET requests
for (const [key, value] of urlParams) {
  switch (key) {
    case "wall":
      console.log(value);

      positionsCircles = [];
      const data = JSON.parse(value);
      const positionFile = data.wall;
      console.log(data.wall);
      positionFile.forEach((position, index) => {
        addToPositionCircleList(position.x, canvas.height - position.y);
      });
      renderWall();
      break;
    case "initPos":
      const data3 = JSON.parse(value);
      x_gap = human[4].x - data3.x;
      y_gap = human[4].y - (canvas.height - data3.y);
      for (let i = 0; i < 4; i++) {
        human[i].x = human[i].x - x_gap;
        human[i].y = human[i].y - y_gap;
      }
      human[4].x = data3.x;
      human[4].y = canvas.height - data3.y;
      break;
    case "runGenetic":
      getGeneticPath();
      break;
    case "runSymboling":
      getSymbolingPath();
      break;
  }
}

// Apply GET path request
if (urlParams.has("path")) {
  const value = urlParams.get("path");
  const data2 = JSON.parse(value);
  const pathFile = data2.path;
  let legal_move = true;
  pathFile.forEach(async (move, index) => {
    await delay(1000 * index);
    if (legal_move) {
      legal_move = moveHuman(move);
    }
  });
}

/**
 * Apply genetic alogrithm
 */
async function getGeneticPath() {
  const url = "http://127.0.0.1:5000/api/data";

  const jsonData = {"wall" : getPositionsCircles(), "wingspan" : parseInt(curseur.value) };
  console.log(jsonData); 
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    const data = await response.json();
    const pathFile = data.path;
    let legal_move = true;
    pathFile.forEach(async (move, index) => {
      await delay(1000 * index);
      if (legal_move) {
        legal_move = moveHuman(move);
      }
    });
    await delay(1000 * pathFile.length);
    exportPathFile()
  } catch (error) {
    console.error("Erreur lors de l'envoi des données:", error);
  }
}

/**
 * Apply genetic alogrithm
 */
async function getAStarPath() {
  const url = "http://127.0.0.1:5000/api/data2";

  const jsonData = {"wall" : getPositionsCircles(), "wingspan" : parseInt(curseur.value) };
  console.log(jsonData); 
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    const data = await response.json();
    const pathFile = data.path;
    let legal_move = true;
    console.log(pathFile);
    pathFile.forEach(async (move, index) => {
      await delay(1000 * index);
      if (legal_move) {
        legal_move = moveHuman(move);
      }
    });
    await delay(1000 * pathFile.length);
    exportPathFile()
  } catch (error) {
    console.error("Erreur lors de l'envoi des données:", error);
  }
}


/**
 * Apply genetic alogrithm
*/
async function getQPath() {
  const url = "http://127.0.0.1:5000/api/data3";
  
  const jsonData = {"wall" : getPositionsCircles(), "wingspan" : parseInt(curseur.value) };
  console.log(jsonData); 
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    const data = await response.json();
    const pathFile = data.path;
    let legal_move = true;
    console.log(pathFile);
    pathFile.forEach(async (move, index) => {
      await delay(1000 * index);
      if (legal_move) {
        legal_move = moveHuman(move);
      }
    });
    await delay(1000 * pathFile.length);
    exportPathFile()
  } catch (error) {
    console.error("Erreur lors de l'envoi des données:", error);
  }
}

/**
 * Apply symboling algorithm
 */
async function getSymbolingPath() {
  alert("Not yet implemented");
}
