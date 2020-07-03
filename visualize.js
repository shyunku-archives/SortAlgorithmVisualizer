// $(window).resize(function(){
//     canvasObject.width = canvasWrapper.width();
//     canvasObject.height = canvasWrapper.height();
// });

$(function(){
    canvasObject = document.getElementById("viz_canvas");
    canvasWrapper = $('#viz_canvas_wrapper');
    resize();
    canvasContext = canvasObject.getContext("2d");
    canvasContext.imageSmoothingEnabled = false;

    $(window).on("resize", function(){
        resize();
        init();
    });

    init();

    $('#setting_initial_button').on("click", function(){
        let dataLen = parseInt($('#datanum_slider').val());
        let delayVal = $('#initial_delay_selector option:selected').val();
        let selectedSortMethod = $('#sort_method_selector option:selected').val();
        let advancedMode = $('#check_compare_switcher').hasClass("active");
        let selectedAssignMethod = $('#assign_method_selector option:selected').val();

        let datasize = exponentialDatanumLevel(dataLen);
        sampleSize = datasize;
        sortMethod = selectedSortMethod;
        assignMethod = selectedAssignMethod;
        sortDelay = delayVal;
        advanced = advancedMode;

        $('#data_num_value').text(sampleSize);
        $('#sort_method_value').text(sortMethod);
        $('#delay_value').text(sortDelay+"ms");
        $('#assign_method_value').text(assignMethod);

        init();
    });

    $('#current_delay_selector').on("change", function(){
        let delayVal = $('#current_delay_selector option:selected').val();
        sortDelay = delayVal;
        
        $('#delay_value').text(sortDelay);
    });

    $('#datanum_slider').on("input", function(){
        let datasize = exponentialDatanumLevel($(this).val());
        $('#data_size').text(`(${datasize})`);
    });

    $('#shuffle_button').on("click", function(){
        shuffle();
        draw();
    });

    $('#play_button').on("click", function(){
        sort();
    });

    $('#stop_button').on("click", function(){
        location.reload();
    });

    $('#volume_slider').on("input", function(){
        finalVolume = $(this).val();
        $('#current_volume').text(`(${finalVolume}%)`);
    });

    let toggler = document.querySelector('.toggle-switch');
    toggler.onclick = function(){
        toggler.classList.toggle('active');
    }
});

async function sort(){
    try{
        sortStartCall();

        const startIndex = 0;
        const endIndex = sampleSize-1;
        const size = sampleSize;

        switch(sortMethod){
            case "bubble":
                for(let i=endIndex; i>0; i--){
                    for(let j=0; j<i; j++){
                        if(bigger(j,j+1))await swapBundle(j+1, j);
                        await drawStd(j+1);
                    }
                    longBeep(i);
                }
                break;
            case "selection":
                let min;
                for(let i=startIndex; i<endIndex; i++){
                    min = i;

                    for(let j=i+1; j<size; j++){
                        if(bigger(min, j)) min = j;
                        await drawStd(j);
                    }

                    if(i != min){
                        await swapBundle(min, i);
                        stdIndex = i;
                    }
                }
                break;
            case "quick":
                await quickSort(startIndex, endIndex);
                break;
            case "bogo":
                while(true){
                    let ran = getLowerRandom(size);
                    let ran2 = getLowerRandom(size);

                    stdIndex = ran;
                    longBeep(ran);
                    await swapBundle(ran, ran2);

                    let correct = true;
                    for(let i=startIndex; i<endIndex; i++){
                        if(get(i)>get(i+1)){
                            correct = false;
                            break;
                        }
                    }
                    
                    if(correct)break;
                }
                break;
            case "advanced_bogo":
                while(true){
                    let ran = getLowerRandom(size);
                    let ran2 = getLowerRandom(size);

                    let isMeaningless = pigger(ran2,ran) === bigger(ran2,ran);
                    if(isMeaningless)continue;

                    stdIndex = ran;
                    longBeep(ran);
                    await swapBundle(ran, ran2);

                    let correct = true;
                    for(let i=startIndex; i<endIndex; i++){
                        if(get(i)>get(i+1)){
                            correct = false;
                            break;
                        }
                    }
                    
                    if(correct)break;
                }
                break;
            case "min_max":
                let left = startIndex;
                let right = endIndex;
                while(true){
                    if(left>=right)break;
                    let max = 0, maxInd = -1;
                    for(let i=left;i<=right;i++){
                        if(pigger(get(i), max)){
                            max = get(i);
                            maxInd = i;
                            await drawStd(i);
                        }
                    }
                    if(maxInd != -1){
                        longBeep(right);
                        await swapBundle(right, maxInd);
                        right--;
                    }

                    
                    if(left>=right)break;                    
                    let min = maxValue + 1, minInd = -1;
                    for(let i=right;i>=left;i--){
                        if(pigger(min, get(i))){
                            min = get(i);
                            minInd = i;
                            await drawStd(i);
                        }
                    }
                    console.log(3);
                    if(minInd != -1){
                        longBeep(left);
                        await swapBundle(left, minInd);
                        left++;
                    }
                }
                break;
            case "parallel":
                for(let bs=size-1;bs>0;bs--){
                    for(let ls=0;ls<size-bs;ls++){
                        let rs = ls + bs;

                        await drawStds([ls, rs]);

                        if(bigger(ls, rs)){
                            longBeep(ls);
                            await swapBundle(ls, rs);
                        }
                    }
                }
                break;
            case "foolshaker":
                do{
                    await foolshakerSort(startIndex, endIndex);
                }while(!certify())
                break;
            case "factory":
                let tries = 0;
                do{
                    await factorySort(startIndex, endIndex, tries++);
                }while(!certify())
                break;
        }

        let eachDuration = endMotionDuration / sampleSize;

        if(sampleSize > (maxFrequency - minFrequency)){
            for(let i=0;i<sampleSize;i++){
                setTimeout(function(){
                    drawPillar(i, "#27ff1c");
                }, i*eachDuration);
            }
            for(let i=minFrequency;i<maxFrequency;i++){
                setTimeout(function(){
                    beepWithFreq(10, i, 1);
                }, i*1);
            }
        }else{
            for(let i=0;i<sampleSize;i++){
                setTimeout(function(){
                    beep(7, i, eachDuration*5);
                    drawPillar(i, "#27ff1c");
                }, i*eachDuration);
            }
        }
    }finally{
        sortEndCall();
    }
}

//sort functions

async function factorySort(left, right, tries){
    if(left<right){
        let mid = parseInt((left + right)/2);
        let lmax = MIN_LIMIT;
        let rmin = MAX_LIMIT;
        let lmaxInd = -1, rminInd = -1;
        for(let i=left;i<=mid;i++){
            if(lmax < get(i)){
                lmax = get(i);
                lmaxInd = i;
            }
            compare();
            await drawStd(i);
        }
        for(let i=right;i>=mid+1;i--){
            if(rmin > get(i)){
                rmin = get(i);
                rminInd = i;
            }
            compare();
            await drawStd(i);
        }

        if(lmax > rmin){
            await swapBundle(lmaxInd, rminInd);
        }

        if(tries%2==0){
            await factorySort(mid+1, right);
            await factorySort(left, mid);
        }else{
            await factorySort(left, mid);
            await factorySort(mid+1, right);
        }
    }
}

async function foolshakerSort(left, right){
    if(left<right){
        //console.log(left+", "+right);
        let mid = parseInt((left + right)/2);
        //left~mid - mid+1~right
        let leftSum = 0, rightSum = 0;
        for(let i=left;i<=mid;i++){
            leftSum += get(i);
            await drawStd(i);
        }
        for(let i=right;i>=mid+1;i--){
            rightSum += get(i);
            await drawStd(i);
        }
        let leftAvg = leftSum / (mid-left+1);
        let rightAvg = rightSum / (right-mid);
        if(leftAvg > rightAvg){
            for(let i=left,j=right; i<=mid&&j>=mid+1;i++,j--){
                if(bigger(i,j)){
                    stdIndex = j;
                    longBeep(j);
                    await swapBundle(i, j);
                }
            }
        }else{
            let lmax = MIN_LIMIT;
            let rmin = MAX_LIMIT;
            let lmaxInd = -1, rminInd = -1;
            for(let i=left;i<=mid;i++){
                if(lmax < get(i)){
                    lmax = get(i);
                    lmaxInd = i;
                }
                await drawStd(i);
            }
            for(let i=right;i>=mid+1;i--){
                if(rmin > get(i)){
                    rmin = get(i);
                    rminInd = i;
                }
                await drawStd(i);
            }

            if(lmax > rmin){
                await swapBundle(lmaxInd, rminInd);
            }
        }

        await foolshakerSort(mid+1, right);
        await foolshakerSort(left, mid);
    }
}

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
            await drawColorStds([low, high], "orange");
            await swapBundle(low, high);
            stdIndex = low;
        }
    }while(low<high);

    generalBeep(left);
    await swapBundle(left, high);

    return high;
}

// user function

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
                nextValue = 1 + Math.pow(1.05, i);
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