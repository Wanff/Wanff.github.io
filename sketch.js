function Branch(begin, end) {

    this.begin = begin;
    this.end = end;
    this.finished = false;

    this.show = function () {
        stroke(7, 11, 52);
        strokeWeight(5)
        line(this.begin.x, this.begin.y, this.end.x, this.end.y);
    }

    this.branchLeft = function () {
        var dir = p5.Vector.sub(this.end, this.begin);
        dir.rotate(PI / random(2, 20));
        dir.mult(random(0.3, 0.8));
        var newEnd = p5.Vector.add(this.end, dir);
        var left = new Branch(this.end, newEnd);
        return left;
    }

    this.branchRight = function () {
        var dir = p5.Vector.sub(this.end, this.begin);
        dir.rotate(-PI / random(2, 20));
        dir.mult(random(0.3, 0.8));

        var newEnd = p5.Vector.add(this.end, dir);

        var right = new Branch(this.end, newEnd);

        return right;
    }
}

var counter = 0;

var starX = [];
var starY = [];
var stars = [];

var forestSize;
var resetButton

function preload() {
    // myFont = loadFont('assets/HalvamediumRegular.otf');
}

function setup() {

    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');
    // textFont(myFont);

    initStars();

    forestSize = random(10, 20);
    //create tree and leaves array variables 
    for (let i = 0; i < forestSize; i++) {
        this['tree' + i] = [];
        this['leaves' + i] = [];
    }

    for (let i = 0; i < forestSize; i++) {
        createTree(i);
    }

    // resetButton = createImg('assets/restartIcon.png');
    // resetButton.size(20, 20);
    // resetButton.position(530, 252);
    // resetButton.mousePressed(resetSketch);
}

function resetSketch() {
    clear();
    resetButton.remove();
    setup();
}

function initStars() {
    for (let i = 0; i < 50; i++) {
        stars[i] = new Star();
    }

}


function createTree(num) {

    widthVal = random(1, width)

    if (widthVal > width / 2) {
        endRootVal = widthVal - (widthVal / random(1, 500));
    }
    else {
        endRootVal = widthVal + (widthVal / random(1, 500));
    }

    let a = createVector(widthVal, height);
    let b = createVector(endRootVal, height - random(40, 180));
    let root = new Branch(a, b);

    this['tree' + num][0] = root;

    let branchEnd = 6;
    for (let i = 0; i < branchEnd; i++) {

        for (let i = this['tree' + num].length - 1; i >= 0; i--) {
            if (!this['tree' + num][i].finished) {
                this['tree' + num].push(this['tree' + num][i].branchLeft());
                this['tree' + num].push(this['tree' + num][i].branchRight());
            }
            this['tree' + num][i].finished = true;
        }

        counter++;
        leafSpawnChance = random(0, 1);
        if (counter == branchEnd && leafSpawnChance > 0.2) {
            for (let i = 0; i < this['tree' + num].length; i++) {
                if (!this['tree' + num][i].finished) {
                    let leaf = this['tree' + num][i].end.copy();
                    this['leaves' + num].push(leaf);
                }
            }

        }
    }

    counter = 0;
}


function draw() {

    // drawGradient();
    background(49, 28, 16);

    // drawStars();

    for (let i = 0; i < forestSize; i++) {
        drawTree(i);
    }

    //text
    // noStroke();
    // textSize(25);
    // fill(255)
    // text('F r a c t a l    F o r e s t', 130, 270);

    // noStroke();
    // textSize(15);
    // text('~ V i v e k   S i n g h   N e g i', 130, 310);

}

function drawTree(num) {

    //Show Tree
    for (let i = 0; i < this['tree' + num].length; i++) {
        this['tree' + num][i].show();
    }

    //Show Leaves
    for (let i = 0; i < this['leaves' + num].length; i++) {
        fill(7, 11, 52);
        noStroke();
        ellipse(this['leaves' + num][i].x, this['leaves' + num][i].y, 25, 25);
    }
}


function drawStars() {

    for (let i = 0; i < stars.length; i++) {
        stars[i].draw();
    }

    //moon
    noStroke();
    fill(230, 230, 230, 50);
    ellipse(200, 130, 170, 170);
    fill(230, 230, 230, 150);
    ellipse(200, 130, 130, 130);
    fill(230, 230, 230, 200);
    ellipse(200, 130, 110, 110);
    fill(230, 230, 230);
    ellipse(200, 130, 70, 70);
}

function drawGradient() {
    let color1 = color(255, 129, 0);  //top rgb(255,129,0)
    let color2 = color(49, 28, 16); //bottom
    setGradient(0, 0, windowWidth, windowHeight, color1, color2, "Y");

}

function setGradient(x, y, w, h, c1, c2, axis) {
    noFill();
    if (axis == "Y") {  // Top to bottom gradient
        for (let i = y; i <= y + h; i++) {
            let inter = map(i, y, y + (h * 1.3), 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    }
}

class Star {
    constructor() {
        this.x = random(windowWidth);
        this.y = random(windowHeight - 250);
        this.size = random(0.25, 4);
        this.t = random(TAU);
    }

    draw() {
        this.t += 0.1;
        let scale = this.size + sin(this.t) * 2;
        noStroke();
        fill(255, 255, 255);

        ellipse(this.x, this.y, scale, scale);
    }
}