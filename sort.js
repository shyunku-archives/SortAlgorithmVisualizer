
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