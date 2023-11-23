const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const curseur = document.getElementById("dist");

canvas.width = window.innerWidth - canvas.offsetLeft;
canvas.height = window.innerHeight - 50;
canvas.style.position = "absolute";
canvas.style.top = 50 + "px";
canvas.style.left = 0 + "px";

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
let currentCircle = null;
let finalCircle = null;
let selected = false;
let idCurrentMember = null;

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

humanBody = [];

let body;

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
  body = new Path2D();
  body.ellipse(human[4].x, human[4].y, 25, 30, 0, 0, 2 * Math.PI);
  ctx.fill(body);
  let head = new Path2D();
  head.arc(human[4].x, human[4].y - 35, 20, 0, 2 * Math.PI);
  ctx.fill(head);
  ctx.fillStyle = "blue";
  return members;
}
let members = drawHuman();

let circles = [];

let jsonFileUploaded = false;
let positionsCircles = [];

function uploadPositionFile() {
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
      positionsCircles = data.wall;
      let maxX = Math.max(...positionsCircles.map((p) => p.x));
      let maxY = Math.max(...positionsCircles.map((p) => p.y));
      const coefX = (canvas.width / maxX) * 0.8;
      const coefY = (canvas.height / maxY) * 0.8;
      positionsCircles = positionsCircles.map(
        (p) => new pos(p.x * coefX, canvas.height - p.y * coefY)
      );
      createWall();
      document.getElementById("deleteButton").style.display = "inline";
    };
    reader.readAsText(file);
  };
  circles[0].moveTo(0, 0);
  input.click();
}

function deletePositionFile() {
  document.getElementById("deleteButton").style.display = "none";
  jsonFileUploaded = false;
  positionsCircles = [];
  createWall();
}

function createWall() {
  circles = [];
  human = [
    new pos(center - 70, canvas.height - 120),
    new pos(center + 70, canvas.height - 120),
    new pos(center + 50, canvas.height - 20),
    new pos(center - 50, canvas.height - 20),
    new pos(center, canvas.height - 100),
  ];
  let final = false;
  if (jsonFileUploaded) {
    positionsCircles.forEach((position, index) => {
      if (index == positionsCircles.length - 1) {
        final = true;
      }
      let c = createCircle(position.x, position.y, final);
      addToCircleList(c);
    });
  } else {
    positionsCircles = [];
    const numberCircles = getRandomInt(10, 20);
    for (let i = 0; i < numberCircles; i++) {
      if (i == numberCircles - 1) {
        final = true;
      }
      x = getRandomInt(0, canvas.width);
      y = getRandomInt(0, canvas.height);
      let c = createCircle(x, y, final);
      positionsCircles.push(new pos(x, y));
      addToCircleList(c);
    }
  }
  renderWall();
}

createWall();

function linkMembers() {
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(human[i].x, human[i].y);
    ctx.lineTo(human[4].x, human[4].y);
    ctx.stroke();
  }
}

// Create circle
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function renderWall() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLineDist();
  for (const circle of circles) {
    if (circle == finalCircle) {
      ctx.fillStyle = "green";
    }
    ctx.fill(circle);
    ctx.fillStyle = "blue";
  }
  members = drawHuman();
}

// Listen for mouse moves
canvas.addEventListener("mousedown", function (event) {
  let deleteCircle = false;
  circles.forEach((circle, index) => {
    // Check whether point is inside circle
    if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
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
      currentCircle = circle;
      moved = true;
      // remove from list
      circles.splice(index, 1);
      positionsCircles.splice(index, 1);
    }
  });

  if (ctx.isPointInPath(body, event.offsetX, event.offsetY)) {
    currentCircle = body;
    moved = true;
    isBody = true;
  }

  // click middle button create circle
  if (
    !deleteCircle &&
    (event.button === 1 || (event.button === 0 && event.ctrlKey))
  ) {
    addToCircleList(createCircle(event.offsetX, event.offsetY));
  }
});

canvas.onmousemove = function (event) {
  if (moved && currentCircle != null) {
    // new circle
    renderWall();
    if (isBody) {
      ctx.fillStyle = "red";
      human[4].x = event.offsetX;
      human[4].y = event.offsetY;
      body = createCircle(event.offsetX, event.offsetY);
      currentCircle = body;
      ctx.fillStyle = "blue";
    } else {
      let final = false;
      if (currentCircle == finalCircle) {
        final = true;
      }
      currentCircle = createCircle(event.offsetX, event.offsetY, final);
    }
  }
};

canvas.onmouseup = function (event) {
  if (currentCircle != null && !isBody) {
    addToCircleList(currentCircle);
    positionsCircles.push(new pos(event.offsetX, event.offsetY));
  }
  moved = false;
  isBody = false;
};

canvas.addEventListener("click", function (event) {
  let found = false;
  for (const m of members) {
    if (ctx.isPointInPath(m, event.offsetX, event.offsetY)) {
      selected = !selected;
      found = true;
      idCurrentMember = members.indexOf(m);
    }
  }
  if (!found && selected) {
    for (const circle of circles) {
      if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
        if (checkContraints(event.offsetX, event.offsetY)) {
          human[idCurrentMember].x = event.offsetX;
          human[idCurrentMember].y = event.offsetY;
          centreDeGravite();
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

function checkContraints(x, y) {
  return checkDistance(x, y) && checkHandsOnTop(x, y);
}

function checkDistance(x, y) {
  const adjacent = (idCurrentMember + 2) % 4;
  const a = distanceBody(human[adjacent].x, human[adjacent].y);
  const b = distanceBody(x, y);
  return a + b < parseInt(curseur.value);
}

function checkHandsOnTop(x, y) {
  const hand = idCurrentMember == 0 || idCurrentMember == 1;
  if (hand) {
    return y < human[2].y && y < human[3].y;
  }
  return y > human[0].y && y > human[1].y;
}

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

function distanceBody(x, y) {
  return distanceCalculation(x, human[4].x, y, human[4].y);
}

curseur.addEventListener("change", function (e) {
  renderWall();
});

function intersection() {
  let Denom =
    (human[0].x - human[2].x) * (human[1].y - human[3].y) -
    (human[0].y - human[2].y) * (human[1].x - human[3].x);
  if (Denom != 0) {
    let xNum =
      (human[0].x * human[2].y - human[0].y * human[2].x) *
        (human[1].x - human[3].x) -
      (human[0].x - human[2].x) *
        (human[1].x * human[3].y - human[1].y * human[3].x);
    let yNum =
      (human[0].x * human[2].y - human[0].y * human[2].x) *
        (human[1].y - human[3].y) -
      (human[0].y - human[2].y) *
        (human[1].x * human[3].y - human[1].y * human[3].x);
    human[4].x = xNum / Denom;
    human[4].y = yNum / Denom;
  }
}

function centreSegment(x1, x2, y1, y2) {
  let xi = (x1 + x2) / 2;
  let yi = (y1 + y2) / 2;
  return [xi, yi];
}

function centreDeGravite() {
  c1 = centreSegment(human[0].x, human[1].x, human[0].y, human[1].y);
  c2 = centreSegment(human[2].x, human[3].x, human[2].y, human[3].y);
  gravite = centreSegment(c1[0], c2[0], c1[1], c2[1]);
  human[4].x = gravite[0];
  human[4].y = gravite[1];
  console.log(human[4]);
}
