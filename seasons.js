// Inspiration:
// https://github.com/ktcv/fractal-sakura/tree/main
// https://github.com/NathanBHart/fractal-trees-generative-art
// https://github.com/naabvb/fractalExperiments?tab=readme-ov-file

class Tree {
    constructor(options = {}) {
        this.season = options.season || "spring";
        this.size = options.size || 200;
        this.maxLevel = options.maxLevel || 11;
        this.rot = options.rot || 0.37;
        this.lenRand = options.lenRand || 0.8;
        this.branchProb = options.branchProb || 0.95;
        this.rotRand = options.rotRand || 0.2;

        //spring
        this.flowerProb = options.flowerProb || 0.67;
        this.flowerColors = options.flowerColors || ['#cf4646', '#F93784', '#DFACC8'] // red, reddish, light pink

        //summer
        this.summerSkewProb = options.summerSkewProb || 0.15;
        // this.leafColors = options.leafColors || ["#239b57", "#1d8e4e", "#1a7a45",  "#125234", "#0e3e2b"];
        // this.leafColors = options.leafColors || ["#239b57"];
        this.leafColor = options.leafColor || "#239b57";

        //fall 
        //https://www.schemecolor.com/maple-autumn-color-combination.php 
        //'#5A9B36' is green
        // this.fallLeafColors = options.leafColors || ['#FFBB19', '#E38720', '#D1221D', '#EA2F3A']
        //https://color.adobe.com/Maple-Leaves-color-theme-8474591/
        // this.fallLeafColors = options.leafColors || ['#A4414F', '#BEB36D', '#BE6F5F', '#560202']
        
        this.fallLeafColors = options.leafColors || ['#FABE01', '#F45D01', '#FFBB19', '#E38720']

        this.mutating = options.hasOwnProperty('mutating') ? options.mutating : true;
        this.randBias = options.randBias || 5;

        this.randSeed = Math.floor(Math.random() * 1000);
        this.paramSeed = Math.floor(Math.random() * 1000);
    }
}

//Utilities
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function rand() {
    return random(1000) / 1000
}

function rand2() {
    return random(2000) / 1000 - 1
}

function rrand(tree) {
    return rand2() + tree.randBias
}

function weightedRandomChoice(items, weights) {
    //https://stackoverflow.com/questions/43566019/how-to-choose-a-weighted-random-array-element-in-javascript
    if (weights.length == 0){
        weights = new Array(items.length).fill(1 / items.length);
    }
    var i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];
    
    var randomWeight = rand() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > randomWeight)
            break;
    
    return items[i];
}

//Global Variables
let prog = 1
let growing = true
let tree1;
let tree2;
let seasons = ["spring", "summer", "fall", "winter"];

function startGrow(tree) {
    growing = true
    prog = 1
    grow(tree)
}

function restartTrees(trees){
    for (let tree of trees){
        tree.randSeed = Math.floor(Math.random() * 1000)
        tree.paramSeed = Math.floor(Math.random() * 1000)

        startGrow(tree)
    }
}


function changeSeasons(trees){
    for (let tree of trees){
        tree.randSeed = Math.floor(Math.random() * 1000)
        tree.paramSeed = Math.floor(Math.random() * 1000)

        currSeasonIndex = seasons.indexOf(tree.season)
        tree.season = seasons[(currSeasonIndex + 1) % seasons.length]
        startGrow(tree)
    }
}

function grow(tree) {
  if (prog > tree.maxLevel + 3) {
    prog = tree.maxLevel + 3
    loop()
    growing = false
    return
  }

  let startTime = millis()
  loop()
  let diff = millis() - startTime

  prog += ((tree.maxLevel / 7.6) * Math.max(diff, 20)) / 2000
  setTimeout(() => grow(tree), Math.max(2, 20 - diff))
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight)

    tree1 = new Tree({season : "winter"})
    tree2 = new Tree({season : "winter", randBias : 6}) //important that you don't do let so that tree2 is still global variable

    let seasonButton = document.getElementById('season');
    seasonButton.addEventListener('click', () => changeSeasons([tree1, tree2]));

    console.log(tree1)
    console.log(tree2)

    mutate(tree1)
    startGrow(tree1)

    mutate(tree2)
    startGrow(tree2)
}

function mutate(tree) {
    if (!tree.mutating) return

    let startTime = millis()
    randomSeed(tree.paramSeed)

    let n = noise(startTime / 12000) - 0.5

    tree.randBias = 4 * Math.abs(n) * n
    
    tree.paramSeed = 1000 * random()
    randomSeed(tree.randSeed)

    let diff = millis() - startTime

    if (diff < 20) setTimeout(() => mutate(tree), 20 - diff)
    else setTimeout(() => mutate(tree), 1)
}

function draw() {
    stroke(245, 245) // white
    // stroke(26, 39, 35)

    background(49, 28, 16)

    push();
    translate(width * 0.70, height + 15)
    scale(1, -1)
    translate(0, 20)
    branch(tree1, 1, tree1.randSeed)
    pop()

    push()
    translate(width * 0.55, height + 15)
    scale(1, -1)
    translate(0, 20)
    branch(tree2, 1, tree2.randSeed)
    pop()
}

function branch(tree, level, seed) {
    if (prog < level) return

    randomSeed(seed)

    let seed1 = random(1000),
    seed2 = random(1000)

    let growthLevel = prog - level > 1 || prog >= tree.maxLevel + 1 ? 1 : prog - level

    strokeWeight(12 * Math.pow((tree.maxLevel - level + 1) / tree.maxLevel, 2))

    let len = growthLevel * tree.size * (1 + rand2() * tree.lenRand)

    line(0, 0, 0, len / level)
    translate(0, len / level)

    let doBranch1 = prog <= 2 ? true : rand() < tree.branchProb
    let doBranch2 = prog <= 2 ? true : rand() < tree.branchProb

    let doFlower = rand() < tree.flowerProb
    let doSkew = rand() < tree.summerSkewProb
    let flowerColor = weightedRandomChoice(tree.flowerColors, [0.5, 0.4, 0.1])
    let fallLeafColor = weightedRandomChoice(tree.fallLeafColors, [0.2, 0.2, 0.3, 0.3])

    if (level < tree.maxLevel) {
    let r1 = tree.rot * (1 + rrand(tree) * tree.rotRand)
    let r2 = -tree.rot * (1 - rrand(tree) * tree.rotRand)

    if (doBranch1) {
        push()
        rotate(r1)
        branch(tree, level + 1, seed1)
        pop()
    }
    if (doBranch2) {
        push()
        rotate(r2)
        branch(tree, level + 1, seed2)
        pop()
    }
    }

    if ((level >= tree.maxLevel || (!doBranch1 && !doBranch2)) && doFlower) {
    if (tree.season == "spring"){
        let p = Math.min(1, Math.max(0, prog - level))

        let flowerSize = (tree.size / 100) * p * (1 / 6) * (len / level)

        strokeWeight(1)
        stroke(flowerColor)

        rotate(-PI)
        for (let i = 0; i <= 8; i++) {
            line(0, 0, 0, flowerSize * (1 + 0.5 * rand2()))
            rotate((2 * PI) / 8)
        }
    } else if (tree.season == "summer"){
        stroke(tree.leafColor); // Leaf green color
        fill(tree.leafColor); // Fill color for the leaf

        strokeWeight(1);

        let p = Math.min(1, Math.max(0, prog - level))

        let leafSize = tree.size / 12 * p

        // Start drawing the leaf shape
        beginShape();

        // Left side of the leaf
        vertex(0, 0);
        let leafShape = 2 + (len / (40 *level));
        let skew = 1;

        if (doSkew){
            skew = 0.5;
        }
        bezierVertex(-leafSize / leafShape, -leafSize / leafShape, skew * -leafSize / leafShape, skew * leafSize / leafShape, 0, leafSize);
        // Right side of the leaf
        bezierVertex(leafSize / leafShape, leafSize / leafShape, skew * leafSize / leafShape, skew * -leafSize / leafShape, 0, 0);

        endShape();

        // Leaf stem
        line(0, 0, 0, leafSize);
    } else if (tree.season == "fall"){
        let p = Math.min(1, Math.max(0, prog - level))

        let leafSize = tree.size / 12 * p

        fill(fallLeafColor); // Maple leaf color
        noStroke(); // No border

        // Start drawing the leaf shape
        beginShape();
        vertex(0, 0);
        let leafShape = 2 + (len / (40 *level));
        let skew = 1;

        if (doSkew){
            skew = 0.5;
        }
        bezierVertex(-leafSize / leafShape, -leafSize / leafShape, skew * -leafSize / leafShape, skew * leafSize / leafShape, 0, leafSize);
        bezierVertex(leafSize / leafShape, leafSize / leafShape, skew * leafSize / leafShape, skew * -leafSize / leafShape, 0, 0);

        endShape();
        line(0, 0, 0, leafSize);

    } else if (tree.season == "winter"){

    }


    }
}