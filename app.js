import { drawLine, clear, drawTriangle, drawCircle } from './canvas.js';
import { 
    vectorSubtract, applyPerspectiveProjection, mapToCanvasCoordinates, 
    multiplyMatVec, transpose, multiplyMatrices, 
    isInFront, clipPoint, 
    yawRotationMatrix, pitchRotationMatrix, 
    getPointOnCanvas, pointToCamera } from './math.js';
import { cube, pentagonalPrism, tetrahedron, octahedron, triangularPrism } from './exampleobjects.js';

const canvas = document.getElementById('canvas');

// const Triangle3D = [
//     [150, 50, 100],
//     [50, 150, 0],
//     [150, 150, 0]
// ];
let cameraPosition = [0, 0, 200];
let orientationMatrix = [
    [1, 0, 0], // X-axis
    [0, 1, 0], // Y-axis
    [0, 0, 1]  // Z-axis
]
// const FOV = 90; // Field of View in degrees 
const sensitivity = 5; // Sensitivity for camera rotation

let displaySettings = {
    width: canvas.width,
    height: canvas.height,
    FOV: 90 // Field of View in degrees
}

const axisLength = 100; // Length of the axis lines

const testPoints = [[80, 50, 50]];
const testLines = [
    // Axis lines
    [[-axisLength, 0, 0], [axisLength, 0, 0]],
    [[0, -axisLength, 0], [0, axisLength, 0]],
    [[0, 0, -axisLength], [0, 0, axisLength]],
    // Arrows
    [[axisLength, 0, 0], [axisLength - 10, 5, 0]],
    [[axisLength, 0, 0], [axisLength - 10, -5, 0]],
    [[0, axisLength, 0], [5, axisLength - 10, 0]],
    [[0, axisLength, 0], [-5, axisLength - 10, 0]],
    [[0, 0, axisLength], [5, 0, axisLength - 10]],
    [[0, 0, axisLength], [-5, 0, axisLength - 10]]
]
const objects = []; 

// Initial render (called inside resizeCanvas)
resizeCanvas();
updateDisplay(cameraPosition, orientationMatrix);

function render(points, lines, objects, cameraPosition = [0, 0, 200], displaySettings) {
    clear();

    // Draw the points
    points.forEach(point => {
        const toCamera = pointToCamera(point, cameraPosition, orientationMatrix);
        if (isInFront(toCamera)) { // We would get null if the point is behind the camera
            const pointOnCanvas = getPointOnCanvas(toCamera, displaySettings);
            drawCircle(pointOnCanvas[0], pointOnCanvas[1], 5, 'red', true);
        }
    });
    // Draw the lines
    lines.forEach(line => {
        // Points relative to the camera
        const start = pointToCamera(line[0], cameraPosition, orientationMatrix);
        const end = pointToCamera(line[1], cameraPosition, orientationMatrix);
        if (isInFront(start) && isInFront(end)) {
            const startOnCanvas = getPointOnCanvas(start, displaySettings);
            const endOnCanvas = getPointOnCanvas(end, displaySettings);
            drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], 'white', 2);
        } else if (isInFront(start)) {
            console.log(start, end);
            const startOnCanvas = getPointOnCanvas(start, displaySettings);
            const clippedPoint = clipPoint(end, start);
            const endOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
            drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], 'white', 2);
        } else if (isInFront(end)) {
            const endOnCanvas = getPointOnCanvas(end, displaySettings);
            const clippedPoint = clipPoint(start, end);
            const startOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
            drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], 'white', 2);
        } // Otherwise, both points are behind the camera and we skip drawing this line    
    });
}

// When the arrow keys are pressed, move the camera
document.addEventListener('keydown', (event) => {
    const step = 10; // Step size for camera movement
    switch (event.key) {
        case 'ArrowLeft':
            // No need to change camera Y (since we have no roll)
            cameraPosition[0] -= step * orientationMatrix[0][0];
            cameraPosition[2] -= step * orientationMatrix[2][0]; // Z-axis is inverted in canvas coordinates
            break;
        case 'ArrowRight':
            cameraPosition[0] += step * orientationMatrix[0][0];
            cameraPosition[2] += step * orientationMatrix[2][0]; // Z-axis is inverted in canvas coordinates
            break;
        case 'i': // Move up in global Y-axis
            cameraPosition[1] += step;
            break;
        case 'k':
            cameraPosition[1] -= step;
            break;
        case 'ArrowUp':
            // Z-axis is inverted in canvas coordinates (move forward = subtract from Z)
            cameraPosition[0] -= step * orientationMatrix[0][2];
            cameraPosition[1] -= step * orientationMatrix[1][2];
            cameraPosition[2] -= step * orientationMatrix[2][2]; 
            break;
        case 'ArrowDown':
            // inverse - move backward = add to Z
            cameraPosition[0] += step * orientationMatrix[0][2];
            cameraPosition[1] += step * orientationMatrix[1][2];
            cameraPosition[2] += step * orientationMatrix[2][2];
            break;
        case 'd': // Rotate right (yaw)
            orientationMatrix = multiplyMatrices(yawRotationMatrix(sensitivity), orientationMatrix); // Rotate right by 5 degrees
            break;
        case 'a': // Rotate left (yaw)
            orientationMatrix = multiplyMatrices(yawRotationMatrix(-sensitivity), orientationMatrix); // Rotate left by 5 degrees
            break;
        case 'w': // Rotate up (pitch)
            orientationMatrix = multiplyMatrices(orientationMatrix, pitchRotationMatrix(sensitivity)); // Rotate down by 5 degrees
            break;
        case 's': // Rotate down (pitch)
            orientationMatrix = multiplyMatrices(orientationMatrix, pitchRotationMatrix(-sensitivity)); // Rotate up by 5 degrees
            break;
    }
    updateDisplay(cameraPosition, orientationMatrix);
    render(testPoints, testLines, objects, cameraPosition, displaySettings);
});

function resizeCanvas() {
    displaySettings.width = window.innerWidth;
    displaySettings.height = window.innerHeight;
    canvas.width = displaySettings.width;
    canvas.height = displaySettings.height;
    render(testPoints, testLines, objects, cameraPosition, displaySettings);
}

function updateDisplay([cameraX, cameraY, cameraZ], orientationMatrix) {
    document.getElementById('x').textContent = "X: " + cameraX.toFixed(2);
    document.getElementById('y').textContent = "Y: " + cameraY.toFixed(2);
    document.getElementById('z').textContent = "Z: " + cameraZ.toFixed(2);
    let textMatrix = "Orientation Matrix:\n";
    orientationMatrix.forEach(row => {
        textMatrix += "[" + row.map(value => value.toFixed(2)).join(' ') + "]" + '\n';
    });
    document.getElementById('orientation').textContent = textMatrix;
}

window.addEventListener('resize', resizeCanvas);