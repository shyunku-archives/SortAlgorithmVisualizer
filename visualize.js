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
            case "radix":
                let digit = 0;
                const bucket = new Array(10);
                do{
                    for(let i=0;i<10;i++){
                        bucket[i] = [];
                    }
                    for(let i=0;i<size;i++){
                        bucket[getDigit(get(i), digit)].push(get(i));
                    }
                    for(let i=0, k=0;i<10;i++){
                        for(let j=0;j<bucket[i].length;j++,k++){
                            valueBundle[k] = bucket[i][j];
                            await drawStd(k);
                        }
                    }
                    digit++;
                }while(!certify())
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

function getDigit(num, i){
    return parseInt(num/Math.pow(10,i))%10;
}