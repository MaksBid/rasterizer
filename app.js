import { drawLine, clear, drawTriangle, drawCircle } from './canvas.js';
import { applyPerspectiveProjection, mapToCanvasCoordinates, vectorSubtract, isInFront, multiplyMatVec, transpose, multiplyMatrices, yawRotationMatrix, pitchRotationMatrix } from './math.js';
import { cube, pentagonalPrism, tetrahedron, octahedron, triangularPrism } from './exampleobjects.js';

const canvas = document.getElementById('canvas');
let width = canvas.width;
let height = canvas.height;
let aspectRatio = width / height;

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
const FOV = 90; // Field of View in degrees 
const sensitivity = 5; // Sensitivity for camera rotation

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
const objects = [triangularPrism]; 

// Initial render (called inside resizeCanvas)
resizeCanvas();
updateDisplay(cameraPosition, orientationMatrix);

function render(points, lines, objects, cameraPosition = [0, 0, 200], canvasWidth = width, canvasHeight = height) {
    clear();

    // Draw the points
    points.forEach(point => {
        const pointOnCanvas = getPointOnCanvas(point, cameraPosition, canvasWidth, canvasHeight);
        if (pointOnCanvas) { // We would get null if the point is behind the camera
            drawCircle(pointOnCanvas[0], pointOnCanvas[1], 5, 'red', true);
        }
    });
    // Draw the lines
    lines.forEach(line => {
        const start = getPointOnCanvas(line[0], cameraPosition, canvasWidth, canvasHeight);
        const end = getPointOnCanvas(line[1], cameraPosition, canvasWidth, canvasHeight);
        if (start && end) { 
            drawLine(start[0], start[1], end[0], end[1], 'white', 2);
        }
    });

    // Draw the objects edges
    objects.forEach(object => {
        object.edges.forEach(edge => {
            const start = object.vertices[edge[0]];
            const end = object.vertices[edge[1]];
            const startOnCanvas = getPointOnCanvas(start, cameraPosition, canvasWidth, canvasHeight);
            const endOnCanvas = getPointOnCanvas(end, cameraPosition, canvasWidth, canvasHeight);
            if (!(startOnCanvas && endOnCanvas)) {
                return; // Skip drawing if either point is behind the camera
            }
            drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], object.color, 2);
        });
    });
    // Draw the objects mesh
    objects.forEach(object => {
        if (object.triangleMesh) {
            object.triangleMesh.forEach(triangle => {
                const pointsOnCanvas = triangle.map(index => {
                    const vertex = object.vertices[index];
                    return getPointOnCanvas(vertex, cameraPosition, canvasWidth, canvasHeight);
                });
                // Check if all points are in front of the camera
                if (pointsOnCanvas.some(point => point === null)) {
                    return; // Skip rendering this triangle if any point is behind the camera
                }
                drawTriangle(pointsOnCanvas, object.triangleMeshColor);
            });
        }
    });
}

function getPointOnCanvas([x, y, z], cameraPosition = [0, 0, 200], canvasWidth = width, canvasHeight = height) {
    // Translate the point relative to the camera position
    const translatedPoint = vectorSubtract([x, y, z], cameraPosition);

    // Rotate the point using the orientation matrix
    const rotatedPoint = multiplyMatVec(transpose(orientationMatrix), translatedPoint)
    
    // Check if the point is in front of the camera
    if (!isInFront(rotatedPoint)) {
        return null; // Point is behind the camera, do not render
    }

    // Apply perspective projection
    const aspectRatio = canvasWidth / canvasHeight;
    const projectedPoint = applyPerspectiveProjection(rotatedPoint, FOV, aspectRatio);
    
    // Map the projected point to canvas coordinates
    return mapToCanvasCoordinates(projectedPoint, canvasWidth, canvasHeight);
}

// When the arrow keys are pressed, move the camera
document.addEventListener('keydown', (event) => {
    const step = 10; // Step size for camera movement
    switch (event.key) {
        case 'ArrowLeft':
            cameraPosition[0] -= step;
            break;
        case 'ArrowRight':
            cameraPosition[0] += step;
            break;
        case 'i':
            cameraPosition[1] += step;
            break;
        case 'k':
            cameraPosition[1] -= step;
            break;
        case 'ArrowUp': // Move forward
            cameraPosition[2] += step;
            break;
        case 'ArrowDown': // Move backward
            cameraPosition[2] -= step;
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
    render(testPoints, testLines, objects, cameraPosition, width, height);
});

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    aspectRatio = width / height;
    render(testPoints, testLines, objects, cameraPosition, width, height);
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