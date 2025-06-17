import { drawLine, clear, drawTriangle, drawCircle, drawQuad } from './canvas.js';
import { 
    vectorSubtract, applyPerspectiveProjection, mapToCanvasCoordinates, 
    multiplyMatVec, transpose, multiplyMatrices, 
    isInFront, clipPoint, 
    yawRotationMatrix, pitchRotationMatrix, 
    getPointOnCanvas, pointToCamera, 
    clipTriangle} from './math.js';
import { cube, pentagonalPrism, tetrahedron, octahedron, triangularPrism } from './exampleobjects.js';

const canvas = document.getElementById('canvas');

let displaySettings = {
    width: canvas.width,
    height: canvas.height,
    FOV: 90 // Field of View in degrees
}
let camera = {
    position: [50, 50, 200], // Camera position in world coordinates
    orientation: [ // Orientation matrix (identity matrix for no rotation)
        [1, 0, 0], // X-axis
        [0, 1, 0], // Y-axis
        [0, 0, 1] // Z-axis
    ]
}

const config = {
    sensitivity: 5, // Sensitivity for camera rotation
    step: 10, // Step size for camera movement
    axisLength: 200 // Length of the axis lines
}

const testPoints = [[80, 50, 50]];
const testLines = [
    // Axis lines
    [[-config.axisLength, 0, 0], [config.axisLength, 0, 0]],
    [[0, -config.axisLength, 0], [0, config.axisLength, 0]],
    [[0, 0, -config.axisLength], [0, 0, config.axisLength]],
    // Arrows
    [[config.axisLength, 0, 0], [config.axisLength - 10, 5, 0]],
    [[config.axisLength, 0, 0], [config.axisLength - 10, -5, 0]],
    [[0, config.axisLength, 0], [5, config.axisLength - 10, 0]],
    [[0, config.axisLength, 0], [-5, config.axisLength - 10, 0]],
    [[0, 0, config.axisLength], [5, 0, config.axisLength - 10]],
    [[0, 0, config.axisLength], [-5, 0, config.axisLength - 10]]
]
const testObjects = [triangularPrism]; 

// Initial render (called inside resizeCanvas)
resizeCanvas();
updateDisplay(camera);

function render(points, lines, objects, camera, displaySettings) {
    clear();

    // Draw the points
    points.forEach(point => {
        const toCamera = pointToCamera(point, camera);
        if (isInFront(toCamera)) { // We would get null if the point is behind the camera
            const pointOnCanvas = getPointOnCanvas(toCamera, displaySettings);
            drawCircle(pointOnCanvas[0], pointOnCanvas[1], 5, 'red', true);
        }
    });
    // Draw the lines
    lines.forEach(line => {
        // Points relative to the camera
        const start = pointToCamera(line[0], camera);
        const end = pointToCamera(line[1], camera);
        if (isInFront(start) && isInFront(end)) {
            const startOnCanvas = getPointOnCanvas(start, displaySettings);
            const endOnCanvas = getPointOnCanvas(end, displaySettings);
            drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], 'white', 2);
        } else if (isInFront(start)) {
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

    // Draw the objects
    objects.forEach(object => {
        object.edges.forEach(edge => {
            const start = pointToCamera(object.vertices[edge[0]], camera);
            const end = pointToCamera(object.vertices[edge[1]], camera);
            if (isInFront(start) && isInFront(end)) {
                const startOnCanvas = getPointOnCanvas(start, displaySettings);
                const endOnCanvas = getPointOnCanvas(end, displaySettings);
                drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], object.color, 2);
            } else if (isInFront(start)) {
                const startOnCanvas = getPointOnCanvas(start, displaySettings);
                const clippedPoint = clipPoint(end, start);
                const endOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
                drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], object.color, 2);
            } else if (isInFront(end)) {
                const endOnCanvas = getPointOnCanvas(end, displaySettings);
                const clippedPoint = clipPoint(start, end);
                const startOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
                drawLine(startOnCanvas[0], startOnCanvas[1], endOnCanvas[0], endOnCanvas[1], object.color, 2);
            } // Otherwise, both points are behind the camera and we skip drawing this line
        });
        // Draw triangles
        if (object.triangleMesh) {
            object.triangleMesh.forEach(triangle => {
                const pointsToCamera = triangle.map(index => pointToCamera(object.vertices[index], camera));
                if (pointsToCamera.every(isInFront)) { // Only draw if all points are in front of the camera
                    const projectedPoints = pointsToCamera.map(point => getPointOnCanvas(point, displaySettings));
                    drawTriangle(projectedPoints, object.triangleMeshColor);
                } else if (pointsToCamera.some(isInFront)) { // Else clip
                    const clipped = clipTriangle(pointsToCamera);
                    const projectedPoints = clipped.map(point => getPointOnCanvas(point, displaySettings));
                    if (projectedPoints.length === 3) { 
                        drawTriangle(projectedPoints, object.triangleMeshColor);
                    } else if (projectedPoints.length === 4) { 
                        drawQuad(projectedPoints, object.triangleMeshColor);
                    }
                }
            });
        }
    });
}

// When the arrow keys are pressed, move the camera
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            // No need to change camera Y (since we have no roll)
            camera.position[0] -= config.step * camera.orientation[0][0];
            camera.position[2] -= config.step * camera.orientation[2][0]; // Z-axis is inverted in canvas coordinates
            break;
        case 'ArrowRight':
            camera.position[0] += config.step * camera.orientation[0][0];
            camera.position[2] += config.step * camera.orientation[2][0]; // Z-axis is inverted in canvas coordinates
            break;
        case 'i': // Move up in global Y-axis
            camera.position[1] += config.step;
            break;
        case 'k':
            camera.position[1] -= config.step;
            break;
        case 'ArrowUp':
            // Z-axis is inverted in canvas coordinates (move forward = subtract from Z)
            camera.position[0] -= config.step * camera.orientation[0][2];
            camera.position[1] -= config.step * camera.orientation[1][2];
            camera.position[2] -= config.step * camera.orientation[2][2]; 
            break;
        case 'ArrowDown':
            // inverse - move backward = add to Z
            camera.position[0] += config.step * camera.orientation[0][2];
            camera.position[1] += config.step * camera.orientation[1][2];
            camera.position[2] += config.step * camera.orientation[2][2];
            break;
        case 'd': // Rotate right (yaw)
            camera.orientation = multiplyMatrices(yawRotationMatrix(config.sensitivity), camera.orientation); // Rotate right by 5 degrees
            break;
        case 'a': // Rotate left (yaw)
            camera.orientation = multiplyMatrices(yawRotationMatrix(-config.sensitivity), camera.orientation); // Rotate left by 5 degrees
            break;
        case 'w': // Rotate up (pitch)
            camera.orientation = multiplyMatrices(camera.orientation, pitchRotationMatrix(config.sensitivity)); // Rotate down by 5 degrees
            break;
        case 's': // Rotate down (pitch)
            camera.orientation = multiplyMatrices(camera.orientation, pitchRotationMatrix(-config.sensitivity)); // Rotate up by 5 degrees
            break;
    }
    updateDisplay(camera);
    render(testPoints, testLines, testObjects, camera, displaySettings);
});

function resizeCanvas() {
    displaySettings.width = window.innerWidth;
    displaySettings.height = window.innerHeight;
    canvas.width = displaySettings.width;
    canvas.height = displaySettings.height;
    render(testPoints, testLines, testObjects, camera, displaySettings);
}

function updateDisplay(camera) {
    const cameraX = camera.position[0];
    const cameraY = camera.position[1];
    const cameraZ = camera.position[2];
    document.getElementById('x').textContent = "X: " + cameraX.toFixed(2);
    document.getElementById('y').textContent = "Y: " + cameraY.toFixed(2);
    document.getElementById('z').textContent = "Z: " + cameraZ.toFixed(2);
    let textMatrix = "Orientation Matrix:\n";
    camera.orientation.forEach(row => {
        textMatrix += "[" + row.map(value => value.toFixed(2)).join(' ') + "]" + '\n';
    });
    document.getElementById('orientation').textContent = textMatrix;
}

window.addEventListener('resize', resizeCanvas);