async function drawStd(index){
    redrawPillar();
    drawPillar(index, "red");
    smallBeep(index);

    await sleep();
}

async function drawColorStd(index, color){
    redrawPillar();
    drawPillar(index, color);
    smallBeep(index);

    await sleep();
}

async function drawStds(inds){
    redrawPillar();
    for(let i=0;i<inds.length;i++){
        drawPillar(inds[i], "red");
        smallBeep(inds[i]);
    }

    await sleep();
}

async function drawColorStds(inds, color){
    redrawPillar();
    for(let i=0;i<inds.length;i++){
        drawPillar(inds[i], color);
        smallBeep(inds[i]);
    }

    await sleep();
}

function sortStartCall(){
    $('.disasyncable').attr('disabled', true);
}

function sortEndCall(){
    $('.disasyncable').attr('disabled', false);
}

function compare(){
    comparisons++;
    setComparison(comparisons);
}

function memoryAccess(){
    access++;
    setAccess(access);
}

function sleep(){
    return new Promise(resolve => setTimeout(resolve, sortDelay));
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
        drawPillar(i, "white");
    }
}

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
        let nextValue = 0;
        switch(assignMethod){
            case "sorted":
                nextValue = i+1;
                break;
            case "reversed":
                nextValue = sampleSize-i;
                break;
            case "v_type":
                nextValue = i<sampleSize/2?(sampleSize-2*i):(2*(i-sampleSize/2)+1);
                break;
            case "sin_wave":
                nextValue = 100 + 100*Math.sin(2*Math.PI*i/sampleSize);
                break;
            case "exponential":
                nextValue = 1 + Math.pow(1.02, i);
                break;
            case "randomly":
                nextValue = getLowerRandom(sampleSize);
                break;
        }
        valueBundle[i] = nextValue;
        colorTouched[i] = false;
        if(maxValue < nextValue) maxValue = nextValue;
    }
}

function shuffle(){
    for(let i=0; i<sampleSize;i++){
        let swapIndex = getLowerRandom(sampleSize);
        pureSwapBundle(i, swapIndex);
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
    let pillarWidth = adjustPillarWidth+1;
    let pillarX = centerPos - pillarWidth / 2;
    canvasContext.fillRect(Math.round(pillarX), 0, Math.round(pillarWidth), canvasHeight);
}

function drawPillar(index, color){
    canvasContext.fillStyle = color;
    
    let pillarWidth = adjustPillarWidth+1;

    if((color != "white") && (color != "black")) {
        colorTouched.push(index);
        // pillarWidth = adjustPillarWidth*0.9;
    }

    let centerPos = adjustPillarWidth*(index+0.5);
    
    let pillarHeight = canvasHeight * valueBundle[index] / maxValue;
    let pillarX = centerPos - pillarWidth / 2;
    let pillarY = canvasHeight - pillarHeight;
    canvasContext.fillRect(Math.round(pillarX), pillarY, Math.round(pillarWidth), pillarHeight);
}

function bigger(x, y){
    if(advanced) compare();
    return get(x) > get(y);
}

function pigger(x, y){
    if(advanced) compare();
    return x > y;
}

function pureSwapBundle(x, y){
    let tmp = valueBundle[x];
    valueBundle[x] = valueBundle[y];
    valueBundle[y] = tmp;
}

async function swapBundle(x, y){
    let tmp = valueBundle[x];
    valueBundle[x] = valueBundle[y];
    valueBundle[y] = tmp;
    if(advanced) memoryAccess();
    simpleDraw(x, y);
    generalBeep(y);
    await sleep();
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
    beep(3, index, 20);
}

function generalBeep(index){
    beep(10, index, 20);
}

function longBeep(index){
    beep(10, index, 40);
}

function beep(vol, index, duration){
    let frequencyInterval = maxFrequency - minFrequency;
    let freq = parseInt(minFrequency + (frequencyInterval * valueBundle[index] / maxValue));

    beepWithFreq(vol, freq, duration);
}

function beepWithFreq(vol, freq, duration){
    let oscil = audioContext.createOscillator();
    let rgain = audioContext.createGain();

    oscil.connect(rgain);
    oscil.frequency.value = freq;
    oscil.type="square";

    rgain.connect(audioContext.destination);
    rgain.gain.value = vol*0.01*finalVolume*0.01;
    oscil.start(audioContext.currentTime);
    oscil.stop(audioContext.currentTime + duration*0.001);
}

function resize(){
    canvasObject.width = canvasWrapper.width();
    canvasObject.height = canvasWrapper.height();
    canvasWidth = canvasObject.width;
    canvasHeight = canvasObject.height;
}