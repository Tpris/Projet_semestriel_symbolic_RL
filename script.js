const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - canvas.offsetLeft;
canvas.height = window.innerHeight;

let moved = false
let isBody = false
let currentCircle = null
let selected = false
let idCurrentMember = null

let center = canvas.width/2
class pos{
    constructor(x,y){this.x=x, this.y=y}
} 
let human = [
    new pos(center-70, canvas.height-120),
    new pos(center+70, canvas.height-120),
    new pos(center-50, canvas.height-20),
    new pos(center+50, canvas.height-20),
    new pos(center, canvas.height-100)
]

let body

function drawHuman(){
    linkMembers()
    ctx.fillStyle = 'red';
    let members = []
    for (let i = 0; i < 4; i++) {
        members.push(createCircle(human[i].x,human[i].y))
    }
    body = new Path2D();
    body.ellipse(human[4].x,human[4].y, 25, 30, 0, 0, 2 * Math.PI);
    ctx.fill(body);
    let head = new Path2D()
    head.arc(human[4].x,human[4].y-35, 20, 0, 2 * Math.PI)
    ctx.fill(head)
    ctx.fillStyle = 'blue';
    return members
}
let members = drawHuman()

let circles = []

for (let i = 0; i < 50; i++) {
    x = getRandomInt(0,canvas.width)
    y = getRandomInt(0,canvas.height)
    let c = createCircle(x,y)
    addToCircleList(c)
}

function linkMembers(){
    for (let i = 0; i<4;i++){
        ctx.beginPath()
        ctx.moveTo(human[i].x, human[i].y)
        ctx.lineTo(human[4].x, human[4].y)
        ctx.stroke() 
    }
}

// Create circle
function createCircle(x,y){
    let circle = new Path2D();
    circle.arc(x,y, 10, 0, 2 * Math.PI);
    ctx.fill(circle);
    return circle;
}

function addToCircleList(circle){
    circles.push(circle)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function renderWall(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const circle of circles){
        ctx.fill(circle);
    }
    members = drawHuman()
}


// Listen for mouse moves
canvas.addEventListener('mousedown', function(event) {
    // Check whether point is inside circle
    for (const circle of circles){
        if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
            currentCircle = circle
            moved = true
            // remove from list
            const index = circles.indexOf(currentCircle);
            const x = circles.splice(index, 1);
        }
    }

    if (ctx.isPointInPath(body, event.offsetX, event.offsetY)) {
        currentCircle = body
        moved = true
        isBody=true
    }
});

canvas.onmousemove = function(event) {
    if (moved && currentCircle!=null){
        // new circle
        renderWall()
        if(isBody){
            ctx.fillStyle = 'red';
            human[4].x = event.offsetX
            human[4].y = event.offsetY
            body = createCircle(event.offsetX, event.offsetY)
            currentCircle = body
            ctx.fillStyle = 'blue';
        } else {
            currentCircle = createCircle(event.offsetX, event.offsetY)
        }
    }
}

canvas.onmouseup = function(event) {
    if(currentCircle!=null && !isBody){
        addToCircleList(currentCircle)
    } 
    moved = false
    isBody = false
}


canvas.addEventListener('click', function(event) {
    let found = false
    for (const m of members){
        if (ctx.isPointInPath(m, event.offsetX, event.offsetY)) {
            selected = !selected
            found = true
            idCurrentMember = members.indexOf(m);
        }
    }
    if (!found && selected){
        for (const circle of circles){
            if (ctx.isPointInPath(circle, event.offsetX, event.offsetY)) {
                human[idCurrentMember].x = event.offsetX
                human[idCurrentMember].y = event.offsetY
                selected = false
            }
        }
    }
    renderWall()
});