export function getVector(vecFrom, vecTo) {
    return [vecTo[0] - vecFrom[0], vecTo[1] - vecFrom[1], vecTo[2] - vecFrom[2]];
}

export function getOrtVector(vec) {
    let summ = 0;
    for (var i = 0; i < vec.length; i++) {
        summ += vec[i] * vec[i];
    }
    summ = Math.sqrt(summ);

    return [vec[0] / summ, vec[1] / summ, vec[2] / summ];
}

export function getDistance(from, to) {
    return Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2) + Math.pow(to[2] - from[2], 2));
}

export function sumVector(vec1, vec2, mult) {
    if (isNaN(mult)) {
        return vec1;
    }
    return [vec1[0] + mult * vec2[0], vec1[1] + mult * vec2[1], vec1[2] + mult * vec2[2]];
}