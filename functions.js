const minFrequency = 0;
const maxFrequency = 1300;
const endMotionDuration = 1000;
const audioContext = new AudioContext();

let advanced = false;

let canvasObject = null;
let canvasContext = null;
let canvasWidth = 0;
let canvasHeight = 0;


let valueBundle = [];
let colorTouched = [];
let maxValue = 0;
let adjustPillarWidth = 0;
let stdIndex = -1;


let sampleSize = 100;
let sortDelay = 0;
let sortMethod = "bubble";
let assignMethod = "sorted";
let comparisons = 0;
let arrayAccess = 0;
let finalVolume = 5;

const MIN_LIMIT = -99;
const MAX_LIMIT = 10000000;

function setAccess(val){
    $('#memory_access_num_value').text(val);
}

function setComparison(val){
    $('#comparison_num_value').text(val);
}

function exponentialDatanumLevel(level){
    let levels = [5, 10, 20, 50, 100, 150, 200, 500, 1000, 2000, 3000];
    return levels[level];
}

function certify(){
    for(let i=0;i<valueBundle.length-1;i++){
        if(valueBundle[i] > valueBundle[i+1]){
            return false;
        }
    }

    return true;
}