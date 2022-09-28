import { getOrtVector, getDistance, getVector, sumVector } from './VectorUtils'

export function draw(gl, color, colorLocation, type, positions, vertexCount, offset = 0) {
    if (Array.isArray(positions[0])) {
        positions.forEach(v => draw(gl, color, colorLocation, type, v, vertexCount, offset));
    }

    gl.uniform4f(colorLocation, ...color);

    if (vertexCount == null) {
        vertexCount = positions.length / 3;
    }

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);
    gl.drawArrays(type, offset, vertexCount);
}

export function drawAxes(gl, resolution, colorLocation) {
    var length = 100;

    let positions = [
        // y-axis
        0, 0, -length,
        0, 0, length,
        // z-axis
        0, -length, 0,
        0, length, 0,
        // x-axis
        -length, 0, 0,
        length, 0, 0,
    ];
    draw(gl, [0.7, 0.2, 0.2, 0.6], colorLocation, gl.LINES, positions, 2);
    draw(gl, [0.2, 0.2, 0.7, 0.6], colorLocation, gl.LINES, positions, 2, 2);
    draw(gl, [0.2, 0.7, 0.2, 0.6], colorLocation, gl.LINES, positions, 2, 4);

    drawAxis(gl, resolution, colorLocation);
}

function drawAxis(gl, resolution, colorLocation) {

    var poss = [];
    var height = 0.03 * resolution;
    var length = 0.1 * resolution;
    var count = Math.ceil(30 / resolution);
    for (var i = 1; i <= count; i++) {
        poss.push(
            resolution * i, height, height, // Положительная сторона
            resolution * i, -height, -height,
            resolution * i + length, 0.0, 0.0,
            resolution * i, -height, height, // Перпендикуляр положительной стороны
            resolution * i, height, -height,
            resolution * i + length, 0.0, 0.0,
            -resolution * i, height, height, // Отрицательная сторона
            -resolution * i, -height, -height,
            -resolution * i + length, 0.0, 0.0,
            -resolution * i, -height, height, // Перпендикуляр отрицательной стороны
            -resolution * i, height, -height,
            -resolution * i + length, 0.0, 0.0
        );

        poss.push(
            height, resolution * i, height, // Положительная сторона
            -height, resolution * i, -height,
            0.0, resolution * i + length, 0.0,
            -height, resolution * i, height, // Перпендикуляр положительной стороны
            height, resolution * i, -height,
            0.0, resolution * i + length, 0.0,
            height, -resolution * i, height, // Отрицательная сторона
            -height, -resolution * i, -height,
            0.0, -resolution * i + length, 0.0,
            -height, -resolution * i, height, // Перпендикуляр отрицательной стороны
            height, -resolution * i, -height,
            0.0, -resolution * i + length, 0.0
        );

        poss.push(
            height, height, resolution * i, // Положительная сторона
            -height, -height, resolution * i,
            0.0, 0.0, resolution * i + length,
            -height, height, resolution * i, // Перпендикуляр положительной стороны
            height, -height, resolution * i,
            0.0, 0.0, resolution * i + length,
            height, height, -resolution * i, // Отрицательная сторона
            -height, -height, -resolution * i,
            0.0, 0.0, -resolution * i + length,
            -height, height, -resolution * i, // Перпендикуляр отрицательной стороны
            height, -height, -resolution * i,
            0.0, 0.0, -resolution * i + length
        );
    }

    draw(gl, [0.0, 0.0, 0.0, 0.6], colorLocation, gl.TRIANGLES, poss, 3 * 3 * 2 * 2 * count);
}

export function drawEntity(gl, colorLocation, entities) {
    if (entities.isHiden) {
        return;
    }

    let eSDLength = entities.sideData.length;
    for (var i = 0; i < entities.data.length; i++) {
        if (i > 0 && (i - 1) < eSDLength) {
            draw(gl, entities.sideData[i - 1].color, colorLocation, entities.sideData[i - 1].type, entities.sideData[i - 1].positions, null, entities.sideData[i - 1].offset);
            if (entities.sideData[i - 1].isContured) {
                draw(gl, [0, 0, 0, 1], colorLocation, gl.LINES, entities.sideData[i - 1].positions, null, entities.sideData[i - 1].offset);
            }
        }

        if (entities.data[i].isFilled) {
            draw(gl, entities.data[i].color, colorLocation, entities.data[i].type, entities.data[i].positions, entities.data[i].count, entities.data[i].offset);
        }
        if (entities.data[i].isContured) {
            draw(gl, [0, 0, 0, 1], colorLocation, gl.LINE_LOOP, entities.data[i].positions, entities.data[i].count, entities.data[i].offset);
        }
    }
}

function getCircleDotes(entity, number) {
    var positions = {};
    var angle = entity.rotation[1];
    var [xRot, yRot] = [Math.cos(entity.rotation[0]), Math.cos(entity.rotation[2])];
    var [zxRot, zyRot] = [Math.sin(entity.rotation[0]), Math.sin(entity.rotation[2])];
    var x = function (a) { return xRot * Math.cos(a) * entity.radius; }
    var y = function (a) { return yRot * Math.sin(a) * entity.radius; }
    var z = function (a) { return -entity.radius * (zxRot * Math.cos(a) + zyRot * Math.sin(a)); }

    var dAngle = (Math.PI * 2) / entity.countAngles;

    for (var i = 0; i < entity.countAngles; i++) {
        positions[getNameAngle(number, i)] = [entity.center[0] + x(angle), entity.center[1] + z(angle), entity.center[2] + y(angle)];
        angle += dAngle;
    }

    return positions;
}

function getNameAngle(number, counter) {
    return number + "-" + counter;
}

function getSideDotes(bottomPositions, topPositions, number, inverted = false) {
    let tPL = Object.keys(topPositions).length;
    let bPL = Object.keys(bottomPositions).length;
    if (tPL > bPL) {
        return getSideDotes(topPositions, bottomPositions, number - 1, true);
    }

    var dimension = bPL / tPL;
    var positions = [];
    var lastJ = 0;
    for (var i = 0; i < tPL; i++) {
        var pos = [];
        pos.push(getNameAngle(number, i));
        for (var j = lastJ; j < 1 + Math.round(dimension * (i + 1)); j++) {
            pos.push(getNameAngle((inverted) ? (number + 1) : (number - 1), j % bPL));
            lastJ = j;
        }
        pos.push(getNameAngle(number, (i + 1) % tPL));
        positions.push(pos);
    }

    return positions;
}

function getInternalDotes(dotes, number, thickness) {
    let dL = Object.keys(dotes).length;
    let intDotes = {};
    for (var i = 0; i < dL; i++) {
        let vecFrom = dotes[getNameAngle(number, i)];
        let vecTo1 = dotes[getNameAngle(number, (i + 1) % dL)];
        let vec1 = getVector(vecFrom, vecTo1);
        let vecTo2 = dotes[getNameAngle(number, (i === 0) ? (dL - 1) : (i - 1))];
        let vec2 = getVector(vecFrom, vecTo2);

        let sumVec = getOrtVector(sumVector(vec1, vec2, 1));

        intDotes[getNameAngle(number, i)] = sumVector(vecFrom, sumVec, thickness);
    }

    return intDotes;
}

export function calculateEntity(gl, params, entities) {
    if (entities.isHiden) {
        return;
    }

    if (entities.entity.length === 0) {
        return;
    }

    let currentEntity = Object.assign({}, entities.entity[0]);
    entities.data = [];
    entities.sideData = [];
    entities.internalData = [];

    if (currentEntity.countAngles === "circle") {
        currentEntity.countAngles = params.countAngles;
    }

    let lastPositions = getCircleDotes(currentEntity, 0);
    let lastInternalPositions = getInternalDotes(lastPositions, 0, Math.min(params.thickness, currentEntity.radius));
    entities.data.push({
        color: currentEntity.color,
        positions: [].concat.apply([], Object.values(lastPositions)),
        type: gl.TRIANGLE_FAN,
        count: currentEntity.countAngles,
        offset: 0,
        isContured: currentEntity.isContured,
        isFilled: currentEntity.isFilled
    });
    entities.data.push({
        color: currentEntity.color,
        positions: [].concat.apply([], Object.values(lastInternalPositions)),
        type: gl.TRIANGLE_FAN,
        count: currentEntity.countAngles,
        offset: 0,
        isContured: currentEntity.isContured,
        isFilled: currentEntity.isFilled
    });

    for (var i = 1; i < entities.entity.length; i++) {
        let lastCNR = {
            center: currentEntity.center,
            rotation: currentEntity.rotation
        }
        currentEntity = Object.assign({}, entities.entity[i]);

        if (currentEntity.countAngles === "circle") {
            currentEntity.countAngles = params.countAngles;
        }
        currentEntity.center = updateCenter(lastCNR.center, currentEntity.center, entities.entity[0].rotation[1]);
        currentEntity.rotation = updateRotation(currentEntity.rotation, lastCNR.rotation[1]);
        var newPositions = getCircleDotes(currentEntity, i);
        var sidePositions = getSideDotes(lastPositions, newPositions, i);
        var newInternalPositions = getInternalDotes(newPositions, i, Math.min(params.thickness, currentEntity.radius));

        let divide = getDividedEntity(Object.assign(lastPositions, newPositions), Object.assign(lastInternalPositions, newInternalPositions), sidePositions, lastCNR.center[1] / params.lines, currentEntity.thicknessType, params.parts);
        console.log(currentEntity.thicknessType + " " + divide.length / 9);

        entities.data.push({
            color: currentEntity.color,
            positions: [].concat.apply([], Object.values(newPositions)),
            type: gl.TRIANGLE_FAN,
            count: currentEntity.countAngles,
            offset: 0,
            isContured: currentEntity.isContured,
            isFilled: currentEntity.isFilled
        });
        entities.data.push({
            color: currentEntity.color,
            positions: [].concat.apply([], Object.values(newInternalPositions)),
            type: gl.TRIANGLE_FAN,
            count: currentEntity.countAngles,
            offset: 0,
            isContured: currentEntity.isContured,
            isFilled: currentEntity.isFilled
        });
        entities.sideData.push({
            color: currentEntity.sideColor,
            positions: divide,
            type: gl.TRIANGLES,
            count: null,
            offset: 0,
            isContured: currentEntity.isSideContured
        });

        lastPositions = newPositions;
    }

    return entities;
}

function updateCenter(center, dCenter, angle) {
    return [center[0] + dCenter[0] * Math.cos(angle) - dCenter[2] * Math.sin(angle), center[1] + dCenter[1], center[2] + dCenter[0] * Math.sin(angle) + dCenter[2] * Math.cos(angle)];
}

function updateRotation(rotation, angle) {
    return [rotation[0] * Math.cos(angle) - rotation[2] * Math.sin(angle), rotation[1] + angle, rotation[0] * Math.sin(angle) + rotation[2] * Math.cos(angle)];
}

function getDividedEntity(externalDotes, internalDotes, sideDotes, thickness, type, parts) {
    let divide = [];
    for (var i = 0; i < sideDotes.length; i++) {
        let countDotes = sideDotes[i].length;
        let fDote = sideDotes[i][0],
            lDote = sideDotes[i][countDotes - 1];
        let extVector = getVector(externalDotes[fDote], externalDotes[lDote]),
            intVector = getVector(internalDotes[fDote], internalDotes[lDote]);
        let mult = 1.0 / (countDotes - 2);
        let updExtDote = externalDotes[fDote],
            updIntDote = internalDotes[fDote];
        let counterJ = 1;
        for (var j = 0; j < 2 * countDotes - 5; j++) {
            let nextExtDote = sumVector(updExtDote, extVector, mult);
            let nextIntDote = sumVector(updIntDote, intVector, mult);
            if (j % 2 === 0) {
                if (type === "triangle") {
                    divide = divide.concat(getDivide([updExtDote, updIntDote, nextIntDote, nextExtDote],
                        [externalDotes[sideDotes[i][counterJ]], internalDotes[sideDotes[i][counterJ]], internalDotes[sideDotes[i][counterJ]], externalDotes[sideDotes[i][counterJ]]]));
                } else {
                    divide = divide.concat(getDividedTriangle(
                        [externalDotes[sideDotes[i][counterJ]], updExtDote, nextExtDote],
                        [internalDotes[sideDotes[i][counterJ]], updIntDote, nextIntDote],
                        thickness, type, parts));
                }

                updExtDote = nextExtDote;
                updIntDote = nextIntDote;
            } else {
                if (type === "triangle") {
                    divide = divide.concat(getDivide([updExtDote, updIntDote, updIntDote, updExtDote],
                        [externalDotes[sideDotes[i][counterJ]], internalDotes[sideDotes[i][counterJ]], internalDotes[sideDotes[i][counterJ + 1]], externalDotes[sideDotes[i][counterJ + 1]]]));
                } else {
                    divide = divide.concat(getDividedTriangle(
                        [updExtDote, externalDotes[sideDotes[i][counterJ]], externalDotes[sideDotes[i][counterJ + 1]]],
                        [updIntDote, internalDotes[sideDotes[i][counterJ]], internalDotes[sideDotes[i][counterJ + 1]]],
                        thickness, type, parts));
                }

                counterJ++;
            }
        }
    }
    //for (var i = 0; i < sideDotes.length; i++) {
    //    let firstDote = sideDotes[i][0];
    //    let lastDote = sideDotes[i][1];
    //    for (var j = 2; j < sideDotes[i].length; j++) {
    //        let newDote = sideDotes[i][j];
    //        if (type === "triangle") {
    //            divide = divide.concat(getDivide([externalDotes[firstDote], internalDotes[firstDote], internalDotes[firstDote], externalDotes[firstDote]],
    //                [externalDotes[lastDote], internalDotes[lastDote], internalDotes[newDote], externalDotes[newDote]]));
    //        } else {
    //            divide = divide.concat(getDividedTriangle(
    //                [externalDotes[firstDote], externalDotes[lastDote], externalDotes[newDote]],
    //                [internalDotes[firstDote], internalDotes[lastDote], internalDotes[newDote]],
    //                thickness, type));
    //        }
    //        lastDote = newDote;
    //    }
    //}
    return divide;
}

///                                           ///
///              1'                           ///
///              /|\                          ///
///             / | \     ' - internalDotes   ///
///            /  |  1                        ///
///           /   | /|      - externalDotes   ///
///          /    |/ |                        ///
///         /     /  |                        ///
///        /     /|  |                        ///
///       0' - -/ 2' |                        ///
///        \   /   \ |                        ///
///         \ /     \|                        ///
///          0-------2                        ///
///                                           ///
function getDividedTriangle(externalDotes, internalDotes, thickness, type, parts) {
    let distance = [
        getDistance(externalDotes[0], externalDotes[1]),
        getDistance(internalDotes[0], internalDotes[1]),
        getDistance(externalDotes[0], externalDotes[2]),
        getDistance(internalDotes[0], internalDotes[2])
    ];

    let fSize = distance[0] + distance[1];
    let sSize = distance[2] + distance[3];
    let minSize = Math.min(fSize, sSize);
    let countLines = Math.floor(minSize / (2 * thickness));

    if (countLines < 1) {
        return [];
    }

    let size = [
        2 * thickness * distance[0] / fSize,
        2 * thickness * distance[1] / fSize,
        2 * thickness * distance[2] / sSize,
        2 * thickness * distance[3] / sSize
    ];

    let space = [
        (distance[0] - countLines * size[0]) / (countLines + 1),
        (distance[1] - countLines * size[1]) / (countLines + 1),
        (distance[2] - countLines * size[2]) / (countLines + 1),
        (distance[3] - countLines * size[3]) / (countLines + 1)
    ];

    let vector = [
        getVector(externalDotes[0], externalDotes[1]),
        getVector(internalDotes[0], internalDotes[1]),
        getVector(externalDotes[0], externalDotes[2]),
        getVector(internalDotes[0], internalDotes[2])
    ];

    let divide = [];
    let unshift = 0;
    for (var i = 0; i < countLines; i++) {
        let shift = [
            space[0] + (space[0] + size[0]) * i,
            space[1] + (space[1] + size[1]) * i,
            space[2] + (space[2] + size[2]) * i,
            space[3] + (space[3] + size[3]) * i
        ];

        if (type === "line") {
            divide = divide.concat(getDivide([
                sumVector(externalDotes[0], vector[0], shift[0] / distance[0]),
                sumVector(externalDotes[0], vector[0], (shift[0] + size[0]) / distance[0]),
                sumVector(externalDotes[0], vector[2], (shift[2] + size[2]) / distance[2]),
                sumVector(externalDotes[0], vector[2], shift[2] / distance[2])
            ], [
                sumVector(internalDotes[0], vector[1], shift[1] / distance[1]),
                sumVector(internalDotes[0], vector[1], (shift[1] + size[1]) / distance[1]),
                sumVector(internalDotes[0], vector[3], (shift[3] + size[3]) / distance[3]),
                sumVector(internalDotes[0], vector[3], shift[3] / distance[3])
            ]));
        } else {
            let answer = getDividedLine([
                sumVector(externalDotes[0], vector[0], (shift[0] - unshift * (space[0] + size[0])) / distance[0]),
                sumVector(externalDotes[0], vector[0], (shift[0] + size[0]) / distance[0]),
                sumVector(externalDotes[0], vector[2], (shift[2] + size[2]) / distance[2]),
                sumVector(externalDotes[0], vector[2], (shift[2] - unshift * (space[2] + size[2])) / distance[2])
            ], [
                sumVector(internalDotes[0], vector[1], (shift[1] - unshift * (space[1] + size[1])) / distance[1]),
                sumVector(internalDotes[0], vector[1], (shift[1] + size[1]) / distance[1]),
                sumVector(internalDotes[0], vector[3], (shift[3] + size[3]) / distance[3]),
                sumVector(internalDotes[0], vector[3], (shift[3] - unshift * (space[3] + size[3])) / distance[3])
            ], thickness * (1 - 0.75 * unshift / countLines) / parts);
            if (answer === "more") {
                unshift += 1.0;
                continue;
            }
            unshift = 0.0;
            divide = divide.concat(answer);
        }
    }

    return divide;
}

///                                       ///
///     ' - internalDotes                 ///
///                                       ///
///       - externalDotes                 ///
///                                       ///
///      1'------------------2'           ///
///     / \                 / \           ///
///    1-----------------------2          ///
///     \   \             /   /           ///
///      \   0'- - - - - 3'  /            ///
///       \ /             \ /             ///
///        0---------------3              ///
///                                       ///
function getDividedLine(externalDotes, internalDotes, thickness) {
    let distance = [
        getDistance(externalDotes[0], externalDotes[3]),
        getDistance(externalDotes[1], externalDotes[2]),
        getDistance(internalDotes[0], internalDotes[3]),
        getDistance(internalDotes[1], internalDotes[2])
    ];

    let fSize = distance[0] + distance[1];
    let sSize = distance[2] + distance[3];
    let minSize = Math.min(fSize, sSize);
    let countLines = Math.floor(minSize / (2 * thickness));

    if (countLines < 2) {
        return "more";
    }

    let size = [
        2 * thickness * distance[0] / fSize,
        2 * thickness * distance[1] / fSize,
        2 * thickness * distance[2] / sSize,
        2 * thickness * distance[3] / sSize
    ];

    let space = [
        (distance[0] - countLines * size[0]) / (countLines + 1),
        (distance[1] - countLines * size[1]) / (countLines + 1),
        (distance[2] - countLines * size[2]) / (countLines + 1),
        (distance[3] - countLines * size[3]) / (countLines + 1)
    ];

    let vector = [
        getVector(externalDotes[0], externalDotes[3]),
        getVector(externalDotes[1], externalDotes[2]),
        getVector(internalDotes[0], internalDotes[3]),
        getVector(internalDotes[1], internalDotes[2])
    ];

    let divide = [];
    for (var i = 0; i < countLines; i++) {
        let shift = [
            space[0] + (space[0] + size[0]) * i,
            space[1] + (space[1] + size[1]) * i,
            space[2] + (space[2] + size[2]) * i,
            space[3] + (space[3] + size[3]) * i
        ];

        divide = divide.concat(getDivide([
            sumVector(externalDotes[0], vector[0], shift[0] / distance[0]),
            sumVector(externalDotes[0], vector[0], (shift[0] + size[0]) / distance[0]),
            sumVector(externalDotes[1], vector[1], (shift[1] + size[1]) / distance[1]),
            sumVector(externalDotes[1], vector[1], shift[1] / distance[1])
        ], [
            sumVector(internalDotes[0], vector[2], shift[2] / distance[2]),
            sumVector(internalDotes[0], vector[2], (shift[2] + size[2]) / distance[2]),
            sumVector(internalDotes[1], vector[3], (shift[3] + size[3]) / distance[3]),
            sumVector(internalDotes[1], vector[3], shift[3] / distance[3])
        ]));
    }

    return divide;
}

///                                           ///
///       1'------2'                          ///
///      /|      /|   ' - topDotes            /// 
///     / |     / |                           ///
///    /  0'------3'    - bottomDotes         ///
///   /  /    /  /                            ///
///  1- / - -2  /                             ///
///  | /     | /      type - 'TRIANGLES_FAN'  ///
///  |/      |/                               ///
///  0-------3                                ///
///                                           ///
function getDivide(bottomDotes, topDotes) {
    return [].concat.apply([], [
        bottomDotes[0], bottomDotes[1], bottomDotes[2], bottomDotes[2], bottomDotes[3], bottomDotes[0],
        topDotes[0], topDotes[1], topDotes[2], topDotes[2], topDotes[3], topDotes[0],
        bottomDotes[0], bottomDotes[1], topDotes[1], topDotes[1], topDotes[0], bottomDotes[0],
        bottomDotes[3], bottomDotes[2], topDotes[2], topDotes[2], topDotes[3], bottomDotes[3],
        bottomDotes[0], topDotes[0], topDotes[3], topDotes[3], bottomDotes[3], bottomDotes[0],
        bottomDotes[1], topDotes[1], topDotes[2], topDotes[2], bottomDotes[2], bottomDotes[1]
    ]);
    //return [
    //    [].concat.apply([],
    //        [
    //            bottomDotes[0], bottomDotes[1], topDotes[1], topDotes[0], topDotes[3], bottomDotes[3], bottomDotes[2], bottomDotes[1]
    //        ]),
    //    [].concat.apply([],
    //        [
    //            topDotes[2], topDotes[3], topDotes[0], topDotes[1], bottomDotes[1], bottomDotes[2], bottomDotes[3], topDotes[3]
    //        ])
    //];
}