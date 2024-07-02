//sort functions
async function shellSort() {
  let size = sampleSize;
  let gap = parseInt(size / 2);
  while (gap > 0) {
    for (let i = gap; i < size; i++) {
      let temp = get(i);
      let j = i;
      while (j >= gap && bigger(j - gap, temp)) {
        valueBundle[j] = get(j - gap);
        await drawStd(j);
        j -= gap;
      }
      valueBundle[j] = temp;
      await drawStd(j);
    }
    gap = parseInt(gap / 2);
  }
}

async function countingSort() {
  let size = sampleSize;
  let max = MIN_LIMIT;
  let min = MAX_LIMIT;
  for (let i = 0; i < size; i++) {
    if (max < get(i)) max = get(i);
    if (min > get(i)) min = get(i);
    await drawStd(i);
  }

  let range = max - min + 1;
  let count = new Array(range).fill(0);
  let output = new Array(size);

  for (let i = 0; i < size; i++) {
    count[get(i) - min]++;
    await drawStd(i);
  }

  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  for (let i = size - 1; i >= 0; i--) {
    output[count[get(i) - min] - 1] = get(i);
    count[get(i) - min]--;
    await drawStd(i);
  }

  for (let i = 0; i < size; i++) {
    valueBundle[i] = output[i];
    await drawStd(i);
  }
}

async function insertionSort() {
  let size = sampleSize;
  for (let i = 1; i < size; i++) {
    let key = get(i);
    let j = i - 1;

    while (j >= 0 && bigger(j, key)) {
      valueBundle[j + 1] = get(j);
      await drawStd(j + 1);
      j--;
    }

    valueBundle[j + 1] = key;
    await drawStd(j + 1);
  }
}

async function heapSort() {
  let size = sampleSize;
  for (let i = parseInt(size / 2) - 1; i >= 0; i--) {
    await heapify(size, i);
  }

  for (let i = size - 1; i > 0; i--) {
    await swapBundle(0, i);
    await drawStd(i);
    await heapify(i, 0);
  }
}

async function heapify(size, root) {
  let largest = root;
  let left = 2 * root + 1;
  let right = 2 * root + 2;

  if (left < size && bigger(left, largest)) {
    largest = left;
  }

  if (right < size && bigger(right, largest)) {
    largest = right;
  }

  if (largest != root) {
    await swapBundle(root, largest);
    await drawStd(root);
    await heapify(size, largest);
  }
}

async function mergeSort(left, right) {
  if (left < right) {
    let mid = parseInt((left + right) / 2);
    await mergeSort(left, mid);
    await mergeSort(mid + 1, right);
    await merge(left, mid, right);
  }
}

async function merge(left, mid, right) {
  let i = left;
  let j = mid + 1;
  let k = 0;
  let tmp = new Array(right - left + 1);

  while (i <= mid && j <= right) {
    if (bigger(i, j)) {
      tmp[k++] = get(j++);
    } else {
      tmp[k++] = get(i++);
    }
  }

  while (i <= mid) {
    tmp[k++] = get(i++);
  }
  while (j <= right) {
    tmp[k++] = get(j++);
  }

  for (let i = left, k = 0; i <= right; i++, k++) {
    valueBundle[i] = tmp[k];
    await drawStd(i);
  }
}

async function factorySort(left, right, tries) {
  if (left < right) {
    let mid = parseInt((left + right) / 2);
    let lmax = MIN_LIMIT;
    let rmin = MAX_LIMIT;
    let lmaxInd = -1,
      rminInd = -1;
    for (let i = left; i <= mid; i++) {
      if (lmax < get(i)) {
        lmax = get(i);
        lmaxInd = i;
      }
      compare();
      await drawStd(i);
    }
    for (let i = right; i >= mid + 1; i--) {
      if (rmin > get(i)) {
        rmin = get(i);
        rminInd = i;
      }
      compare();
      await drawStd(i);
    }

    if (lmax > rmin) {
      await swapBundle(lmaxInd, rminInd);
    }

    if (tries % 2 == 0) {
      await factorySort(mid + 1, right);
      await factorySort(left, mid);
    } else {
      await factorySort(left, mid);
      await factorySort(mid + 1, right);
    }
  }
}

async function foolshakerSort(left, right) {
  if (left < right) {
    //console.log(left+", "+right);
    let mid = parseInt((left + right) / 2);
    //left~mid - mid+1~right
    let leftSum = 0,
      rightSum = 0;
    for (let i = left; i <= mid; i++) {
      leftSum += get(i);
      await drawStd(i);
    }
    for (let i = right; i >= mid + 1; i--) {
      rightSum += get(i);
      await drawStd(i);
    }
    let leftAvg = leftSum / (mid - left + 1);
    let rightAvg = rightSum / (right - mid);
    if (leftAvg > rightAvg) {
      for (let i = left, j = right; i <= mid && j >= mid + 1; i++, j--) {
        if (bigger(i, j)) {
          stdIndex = j;
          longBeep(j);
          await swapBundle(i, j);
        }
      }
    } else {
      let lmax = MIN_LIMIT;
      let rmin = MAX_LIMIT;
      let lmaxInd = -1,
        rminInd = -1;
      for (let i = left; i <= mid; i++) {
        if (lmax < get(i)) {
          lmax = get(i);
          lmaxInd = i;
        }
        await drawStd(i);
      }
      for (let i = right; i >= mid + 1; i--) {
        if (rmin > get(i)) {
          rmin = get(i);
          rminInd = i;
        }
        await drawStd(i);
      }

      if (lmax > rmin) {
        await swapBundle(lmaxInd, rminInd);
      }
    }

    await foolshakerSort(mid + 1, right);
    await foolshakerSort(left, mid);
  }
}

async function quickSort(left, right) {
  if (left < right) {
    let part = await quickSort_partition(left, right);
    await quickSort(left, part - 1);
    await quickSort(part + 1, right);
  }
}

async function quickSort_partition(left, right) {
  let low = left;
  let high = right + 1;
  let pivot = get(left);

  do {
    do {
      low++;
    } while (pigger(right, low - 1) && pigger(pivot, get(low)));

    do {
      high--;
    } while (pigger(high, left - 1) && pigger(get(high), pivot));

    if (low < high) {
      await drawColorStds([low, high], "orange");
      await swapBundle(low, high);
      stdIndex = low;
    }
  } while (low < high);

  generalBeep(left);
  await swapBundle(left, high);

  return high;
}
