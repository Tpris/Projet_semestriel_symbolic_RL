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

drawLineDist();

let moved = false;
let isBody = false;
let currentCircle = null;
let selected = false;
let idCurrentMember = null;

let center = canvas.width / 2;
class pos {
  constructor(x, y) {
    (this.x = x), (this.y = y);
  }
}
let human = [
  new pos(center - 70, canvas.height - 120),
  new pos(center + 70, canvas.height - 120),
  new pos(center + 50, canvas.height - 20),
  new pos(center - 50, canvas.height - 20),
  new pos(center, canvas.height - 100),
];

let body;

function drawHuman() {
  linkMembers();
  ctx.fillStyle = "red";
  let members = [];
  for (let i = 0; i < 4; i++) {
    members.push(createCircle(human[i].x, human[i].y));
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

function createWall() {
  circles = [];
  for (let i = 0; i < 50; i++) {
    x = getRandomInt(0, canvas.width);
    y = getRandomInt(0, canvas.height);
    let c = createCircle(x, y);
    addToCircleList(c);
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
function createCircle(x, y) {
  let circle = new Path2D();
  circle.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill(circle);
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
    ctx.fill(circle);
  }
  members = drawHuman();
}

// Listen for mouse moves
canvas.addEventListener("mousedown", function (event) {
  // Check whether point is inside circle
  for (const circle of circles) {
    if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
      currentCircle = circle;
      moved = true;
      // remove from list
      const index = circles.indexOf(currentCircle);
      const x = circles.splice(index, 1);
    }
  }

  if (ctx.isPointInPath(body, event.offsetX, event.offsetY)) {
    currentCircle = body;
    moved = true;
    isBody = true;
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
      currentCircle = createCircle(event.offsetX, event.offsetY);
    }
  }
};

canvas.onmouseup = function (event) {
  if (currentCircle != null && !isBody) {
    addToCircleList(currentCircle);
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
        }
        selected = false;
      }
    }
  }
  renderWall();
});

function checkContraints(x, y) {
  const adjacent = (idCurrentMember + 2) % 4;
  const a = distanceBody(human[adjacent].x, human[adjacent].y);
  const b = distanceBody(x, y);
  return a + b < parseInt(curseur.value);
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
