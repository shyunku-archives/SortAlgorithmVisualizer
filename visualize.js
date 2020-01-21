const minFrequency = 0;
const maxFrequency = 1300;
const endMotionDuration = 1000;
const audioContext = new AudioContext();

const advanced = false;

let canvasObject = null;
let canvasContext = null;
let canvasWidth = 0;
let canvasHeight = 0;


let valueBundle = [];
let colorTouched = [];
let maxValue = 0;
let adjustPillarWidth = 0;
let stdIndex = -1;


let sampleSize = 200;
let sortMethod = "bubble";
let comparisons = 0;
let arrayAccess = 0;

$(function(){
    canvasObject = document.getElementById("viz_canvas");
    canvasWrapper = $('#viz_canvas_wrapper');
    canvasObject.width = canvasWrapper.width();
    canvasObject.height = canvasWrapper.height();
    canvasWidth = canvasObject.width;
    canvasHeight = canvasObject.height;
    canvasContext = canvasObject.getContext("2d");
    canvasContext.imageSmoothingEnabled = false;

    init();

    $('#setting_initial_button').on("click", function(){
        let dataLen = parseInt($('#data_num_input').val());
        let selectedSortMethod = $('#sort_method_selector option:selected').val();

        sampleSize = dataLen;
        sortMethod = selectedSortMethod;

        $('#data_num_value').text(dataLen);
        $('#sort_method_value').text(sortMethod);

        init();
    });

    $('#shuffle_button').on("click", function(){
        shuffle();
        draw();
    });

    $('#play_button').on("click", function(){
        sort();
    });

    // for(let i=0;i<sampleSize;i++){
    //     setTimeout(function(){
    //         beep(0.5, i, 30);
    //         console.log(i);
    //     }, i*30);
    // }
});

async function sort(){
    const startIndex = 0;
    const endIndex = sampleSize-1;
    const size = sampleSize;

    switch(sortMethod){
        case "bubble":
            for(let i=endIndex; i>0; i--){
                for(let j=0; j<i; j++){
                    if(bigger(j,j+1))swapBundle(j, j+1);
                    
                    if(j == i-1) longBeep(j+1);
                    else smallBeep(j);
                    
                    stdIndex = j+1;
                    simpleDraw(j, j+1);

                    await callDraw(0);
                }
            }
            break;
        case "selection":
            let min;
            for(let i=startIndex; i<endIndex; i++){
                min = i;

                for(let j=i+1; j<size; j++){
                    if(bigger(min, j)) min = j;
                }

                if(i != min){
                    swapBundle(i, min);

                    longBeep(i);

                    stdIndex = i;
                    simpleDraw(i, min);

                    await callDraw(0);
                }
            }
            break;
        case "quick":
            await quickSort(startIndex, endIndex);
            break;
    }

    let eachDuration = endMotionDuration / sampleSize;

    if(sampleSize > (maxFrequency - minFrequency)){
        for(let i=minFrequency;i<maxFrequency;i++){
            setTimeout(function(){
                beepWithFreq(1.5, i, 1);
            }, i*1);
        }
    }else{
        for(let i=0;i<sampleSize;i++){
            setTimeout(function(){
                beep(0.7, i, eachDuration*10);
                drawPillar(i, "#27ff1c");
            }, i*eachDuration);
        }
    }
}

//sort functions
async function quickSort(left, right){
    if(left<right){
        let part = await quickSort_partition(left, right);
        await quickSort(left, part-1);
        await quickSort(part+1, right);
    }
}

async function quickSort_partition(left, right){
    let low = left;
    let high = right + 1;
    let pivot = get(left);

    do{
        do{
            low++;
        } while(pigger(right, low-1) && pigger(pivot, get(low)));

        do{
            high--;
        }while(pigger(high, left-1) && pigger(get(high), pivot));

        if(low<high){
            swapBundle(low, high);

            stdIndex = low;
            generalBeep(low);
            simpleDraw(low, high);
            await callDraw(0);
        }
    }while(low<high);
    
    swapBundle(left, high);

    stdIndex = left;
    generalBeep(left);
    simpleDraw(left, high);
    await callDraw(0);

    return high;
}

function compare(){
    comparisons++;
    setComparison(comparisons);
}

function memoryAccess(){
    access++;
    setAccess(access);
}

function callDraw(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function get(i){
    return valueBundle[i];
}

function init(){
    comparisons = 0;
    access = 0;
    setComparison(comparisons);
    setAccess(access);


    adjustPillarWidth = canvasWidth/sampleSize;
    assign();
    draw();
}

function clear(){
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
}

function draw(){
    clear();
    canvasContext.fillStyle = "white";
    for(let i=0; i<sampleSize;i++){
        drawPillar(i);
    }
}

// function revalidatePrevPillar(){
//     erasePillar(prevIndex);
//     drawPillar(prevIndex);
// }

function simpleDraw(m, n){
    redrawPillar();
    for(let i=0; i<sampleSize;i++){
        if(i !== m && i !== n)continue;
        erasePillar(i);
        drawPillar(i, i===stdIndex?"red":"white");
    }
}


function assign(){
    maxValue = 0;
    for(let i=0; i<sampleSize;i++){
        let nextValue = i + 1;
        valueBundle[i] = nextValue;
        colorTouched[i] = false;
        if(maxValue < nextValue) maxValue = nextValue;
    }
}

function shuffle(){
    for(let i=0; i<sampleSize;i++){
        let swapIndex = getLowerRandom(sampleSize);
        swapBundle(i, swapIndex);
    }
}

function redrawPillar(){
    for(let i=0;i<colorTouched.length;i++){
        let index = colorTouched[i];
        erasePillar(index);
        drawPillar(index, "white");
    }
    colorTouched = [];
}

function erasePillar(index){
    canvasContext.fillStyle = "black";
    let centerPos = adjustPillarWidth*(index+0.5);
    let pillarWidth = adjustPillarWidth;
    let pillarX = centerPos - pillarWidth / 2;
    canvasContext.fillRect(pillarX, 0, pillarWidth, canvasHeight);
}

function drawPillar(index, color){
    canvasContext.fillStyle = color;
    
    let pillarWidth = adjustPillarWidth;

    if(color == "red") {
        colorTouched.push(index);
        pillarWidth = adjustPillarWidth*0.9;
    }

    let centerPos = adjustPillarWidth*(index+0.5);
    
    let pillarHeight = canvasHeight * valueBundle[index] / maxValue;
    let pillarX = centerPos - pillarWidth / 2;
    let pillarY = canvasHeight - pillarHeight;
    canvasContext.fillRect(pillarX, pillarY, pillarWidth, pillarHeight);
}

function bigger(x, y){
    if(advanced) compare();
    return get(x) > get(y);
}

function pigger(x, y){
    if(advanced) compare();
    return x > y;
}

function swapBundle(x, y){
    let tmp = valueBundle[x];
    valueBundle[x] = valueBundle[y];
    valueBundle[y] = tmp;
    if(advanced) memoryAccess();
}

function getRandom(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function getLowerRandom(max){
    return getRandom(0, max);
}

function smallBeep(index){
    beep(0.3, index, 20);
}

function generalBeep(index){
    beep(1, index, 20);
}

function longBeep(index){
    beep(1, index, 40);
}

function beep(vol, index, duration){
    let frequencyInterval = maxFrequency - minFrequency;
    let freq = parseInt(minFrequency + (frequencyInterval * valueBundle[index] / maxValue));
    let oscil = audioContext.createOscillator();
    let rgain = audioContext.createGain();

    oscil.connect(rgain);
    oscil.frequency.value = freq;
    oscil.type="square";

    rgain.connect(audioContext.destination);
    rgain.gain.value = vol*0.01;
    oscil.start(audioContext.currentTime);
    oscil.stop(audioContext.currentTime + duration*0.001);
}

function beepWithFreq(vol, freq, duration){
    let oscil = audioContext.createOscillator();
    let rgain = audioContext.createGain();

    oscil.connect(rgain);
    oscil.frequency.value = freq;
    oscil.type="square";

    rgain.connect(audioContext.destination);
    rgain.gain.value = vol*0.01;
    oscil.start(audioContext.currentTime);
    oscil.stop(audioContext.currentTime + duration*0.001);
}