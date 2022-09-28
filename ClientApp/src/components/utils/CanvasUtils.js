
import { lookAt, inverse, multiply, perspective, yRotation, translate } from './m4_needed'

export function initWebGL(canvas) {
    var gl = null;

    try {
        // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) { }

    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

export function initBuffers(gl) {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    return {
        position: positionBuffer,
    };
}

//
// Draw the scene.
//

export function setSettings(gl) {
    gl.clearColor(0.987, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function setCamera(gl, camera) {
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 60 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 50.0;
    const projectionMatrix = perspective(
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.

    var cameraRadius = 1;
    var cameraHeight = 0.5;

    var cameraMatrix = yRotation(-camera.rotate[1]);
    cameraMatrix = translate(cameraMatrix, cameraRadius, cameraHeight, cameraRadius);

    // Get the camera's position from the matrix we computed
    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ];

    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = inverse(cameraMatrix);

    return [projectionMatrix, multiply(projectionMatrix, viewMatrix)];
}

