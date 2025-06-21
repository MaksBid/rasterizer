import type { Vec3, Vec2, IObject, IScene, ICamera, IDisplaySettings, QueueItem, Line3D, Triangle2D, Triangle3D, Quad2D } from './types/types.ts';
import { drawLine, clear, drawTriangle, drawCircle, drawQuad } from './canvas.js';
import { 
    multiplyMatrices3x3,
    isInFront, clipPoint, 
    yawRotationMatrix, pitchRotationMatrix, 
    getPointOnCanvas, pointToCamera, 
    clipTriangle} from './math.js';
import { cube, pentagonalPrism, tetrahedron, octahedron, triangularPrism } from './exampleobjects.js';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const displaySettings: IDisplaySettings = {
    width: canvas.width,
    height: canvas.height,
    FOV: 90 // Field of View in degrees
}

const camera: ICamera = {
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

const testPoints: Vec3[] = [[80, 50, 50]];
const testLines: Line3D[] = [
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
const testObjects: IObject[] = [triangularPrism]; 

const scene: IScene = {
    points: testPoints,
    lines: testLines,
    objects: testObjects
}

// Initial render (called inside resizeCanvas)
resizeCanvas();
updateDisplay(camera);

function render(scene : IScene, camera : ICamera, displaySettings : IDisplaySettings) {
    clear();
    const queue = sceneToQueue(scene, camera, displaySettings);
    renderQueue(queue);
}

function sceneToQueue(scene : IScene, camera : ICamera, displaySettings : IDisplaySettings): QueueItem[] {
    const queue: QueueItem[] = [];

    // Queue the points
    scene.points.forEach(point => {
        const toCamera = pointToCamera(point, camera);
        if (isInFront(toCamera)) { // We would get null if the point is behind the camera
            const pointOnCanvas = getPointOnCanvas(toCamera, displaySettings);
            queue.push({
                type: 'point',
                screenCoordinates: pointOnCanvas,
                depth: toCamera[2], // Z-coordinate in camera space
                color: 'red' // ATM all the points are red
            });
        }
    });
    // Draw the lines
    scene.lines.forEach(line => {
        // Points relative to the camera
        const start = pointToCamera(line[0], camera);
        const end = pointToCamera(line[1], camera);
        if (isInFront(start) && isInFront(end)) {
            const startOnCanvas = getPointOnCanvas(start, displaySettings);
            const endOnCanvas = getPointOnCanvas(end, displaySettings);
            queue.push({
                type: 'line',
                screenCoordinates: [startOnCanvas, endOnCanvas],
                depth: (start[2] + end[2]) / 2, // Average depth for sorting
                color: 'white' // ATM all the lines are white
            });
        } else if (isInFront(start)) {
            const startOnCanvas = getPointOnCanvas(start, displaySettings);
            const clippedPoint = clipPoint(end, start);
            const endOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
            queue.push({
                type: 'line',
                screenCoordinates: [startOnCanvas, endOnCanvas],
                depth: (start[2] + end[2]) / 2, // Average depth for sorting (of the unclipped)
                color: 'white' // ATM all the lines are white
            });
        } else if (isInFront(end)) {
            const endOnCanvas = getPointOnCanvas(end, displaySettings);
            const clippedPoint = clipPoint(start, end);
            const startOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
            queue.push({
                type: 'line',
                screenCoordinates: [startOnCanvas, endOnCanvas],
                depth: (start[2] + end[2]) / 2, // Average depth for sorting (of the unclipped)
                color: 'white' // ATM all the lines are white
            });
        } // Otherwise, both points are behind the camera and we skip drawing this line    
    });

    // Draw the objects
    scene.objects.forEach(object => {
        object.edges.forEach(edge => {
            const start = pointToCamera(object.vertices[edge[0]], camera);
            const end = pointToCamera(object.vertices[edge[1]], camera);
            if (isInFront(start) && isInFront(end)) {
                const startOnCanvas = getPointOnCanvas(start, displaySettings);
                const endOnCanvas = getPointOnCanvas(end, displaySettings);
                queue.push({
                    type: 'line',
                    screenCoordinates: [startOnCanvas, endOnCanvas],
                    depth: (start[2] + end[2]) / 2, // Average depth for sorting
                    color: object.color // Use the object's color
                });
            } else if (isInFront(start)) {
                const startOnCanvas = getPointOnCanvas(start, displaySettings);
                const clippedPoint = clipPoint(end, start);
                const endOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
                queue.push({
                    type: 'line',
                    screenCoordinates: [startOnCanvas, endOnCanvas],
                    depth: (start[2] + end[2]) / 2, // Average depth for sorting (of the unclipped)
                    color: object.color // Use the object's color
                });
            } else if (isInFront(end)) {
                const endOnCanvas = getPointOnCanvas(end, displaySettings);
                const clippedPoint = clipPoint(start, end);
                const startOnCanvas = getPointOnCanvas(clippedPoint, displaySettings);
                queue.push({
                    type: 'line',
                    screenCoordinates: [startOnCanvas, endOnCanvas],
                    depth: (start[2] + end[2]) / 2, // Average depth for sorting (of the unclipped)
                    color: object.color // Use the object's color
                });
            } // Otherwise, both points are behind the camera and we skip drawing this line
        });
        // Draw triangles
        if (object.triangleMesh) {
            object.triangleMesh.forEach(triangle => {
                // const pointsToCamera = triangle.map(index => pointToCamera(object.vertices[index], camera));
                const pointsToCamera: Triangle3D = [
                    pointToCamera(object.vertices[triangle[0]], camera),
                    pointToCamera(object.vertices[triangle[1]], camera),
                    pointToCamera(object.vertices[triangle[2]], camera)
                ];
                if (pointsToCamera.every(isInFront)) { // If all are in front, draw as it is
                    const projectedPoints = pointsToCamera.map(point => getPointOnCanvas(point, displaySettings));
                    queue.push({
                        type: 'triangle',
                        screenCoordinates: projectedPoints as Triangle2D,
                        depth: (pointsToCamera[0][2] + pointsToCamera[1][2] + pointsToCamera[2][2]) / 3, // Average depth for sorting
                        color: object.triangleMeshColor // Use the object's triangle mesh color
                    });
                } else if (pointsToCamera.some(isInFront)) { // Else clip and draw
                    const clipped = clipTriangle(pointsToCamera);
                    const projectedPoints = clipped.map(point => getPointOnCanvas(point, displaySettings));
                    if (projectedPoints.length === 3) { 
                        queue.push({
                            type: 'triangle',
                            screenCoordinates: projectedPoints as Triangle2D,
                            depth: (pointsToCamera[0][2] + pointsToCamera[1][2] + pointsToCamera[2][2]) / 3, // Average depth for sorting
                            color: object.triangleMeshColor // Use the object's triangle mesh color
                        });
                    } else if (projectedPoints.length === 4) { 
                        queue.push({
                            type: 'quad',
                            screenCoordinates: projectedPoints as Quad2D,
                            depth: (pointsToCamera[0][2] + pointsToCamera[1][2] + pointsToCamera[2][2]) / 3, // Average depth for sorting
                            color: object.triangleMeshColor // Use the object's triangle mesh color
                        });
                    }
                }
            });
        }
    });
    return queue;
}

function renderQueue(queue: QueueItem[]) {
    // Sort the queue by depth (Z-coordinate in camera space)
    // Points closer to the camera should be drawn last
    queue.sort((a, b) => a.depth - b.depth);
    queue.forEach(item => {
        switch (item.type) {
            case 'point':
                drawCircle(item.screenCoordinates, 5, item.color, true);
                break;
            case 'line':
                drawLine(item.screenCoordinates, 
                         item.color, 2);
                break;
            case 'triangle':
                drawTriangle(item.screenCoordinates, item.color);
                break;
            case 'quad':
                drawQuad(item.screenCoordinates, item.color);
                break;
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
            camera.orientation = multiplyMatrices3x3(yawRotationMatrix(config.sensitivity), camera.orientation); // Rotate right by 5 degrees
            break;
        case 'a': // Rotate left (yaw)
            camera.orientation = multiplyMatrices3x3(yawRotationMatrix(-config.sensitivity), camera.orientation); // Rotate left by 5 degrees
            break;
        case 'w': // Rotate up (pitch)
            camera.orientation = multiplyMatrices3x3(camera.orientation, pitchRotationMatrix(config.sensitivity)); // Rotate down by 5 degrees
            break;
        case 's': // Rotate down (pitch)
            camera.orientation = multiplyMatrices3x3(camera.orientation, pitchRotationMatrix(-config.sensitivity)); // Rotate up by 5 degrees
            break;
    }
    updateDisplay(camera);
    render(scene, camera, displaySettings);
});

function resizeCanvas() {
    displaySettings.width = window.innerWidth;
    displaySettings.height = window.innerHeight;
    canvas.width = displaySettings.width;
    canvas.height = displaySettings.height;
    render(scene, camera, displaySettings);
}

function updateDisplay(camera: ICamera) {
    const cameraX = camera.position[0];
    const cameraY = camera.position[1];
    const cameraZ = camera.position[2];
    (document.getElementById('x') as HTMLElement).textContent = "X: " + cameraX.toFixed(2);
    (document.getElementById('y') as HTMLElement).textContent = "Y: " + cameraY.toFixed(2);
    (document.getElementById('z') as HTMLElement).textContent = "Z: " + cameraZ.toFixed(2);
    let textMatrix = "Orientation Matrix:\n";
    camera.orientation.forEach(row => {
        textMatrix += "[" + row.map(value => value.toFixed(2)).join(' ') + "]" + '\n';
    });
    (document.getElementById('orientation') as HTMLElement).textContent = textMatrix;
}

window.addEventListener('resize', resizeCanvas);