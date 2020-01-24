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