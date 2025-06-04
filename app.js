import { drawLine, clear, drawTriangle, drawCircle } from './canvas.js';
import { applyPerspectiveProjection, mapToCanvasCoordinates, vectorSubtract, rotateX, rotateY, rotateZ } from './math.js';
import { cube, pentagonalPrism, tetrahedron, octahedron, triangularPrism } from './exampleobjects.js';

const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;
const halfWidth = width / 2;
const halfHeight = height / 2;
const aspectRatio = width / height;

// const Triangle3D = [
//     [150, 50, 100],
//     [50, 150, 0],
//     [150, 150, 0]
// ];
let cameraPosition = [0, 0, 200];
let cameraPitch = 0; // Camera pitch in degrees
let cameraYaw = 0; // Camera yaw in degrees
const FOV = 90; // Field of View in degrees 

const testPoints = [[80, 50, 50]];
const testLines = [
    [[-100, 0, 0], [100, 0, 0]],
    [[0, -100, 0], [0, 100, 0]],
    [[0, 0, -100], [0, 0, 100]],
]
const objects = [triangularPrism];

function render(points, lines, objects, cameraPosition = [0, 0, 200]) {
    clear();

    let editablePoints = points.map(point => [...point]);
    let editableLines = lines.map(line => line.map(point => [...point]));
    let editableObjects = objects.map(object => ({
        vertices: object.vertices.map(vertex => [...vertex]),
        edges: object.edges,
        color: object.color || 'black'
    }));

    // Translate
    editablePoints = editablePoints.map(point => vectorSubtract(point, cameraPosition));
    editableLines = editableLines.map(line => [
        vectorSubtract(line[0], cameraPosition),
        vectorSubtract(line[1], cameraPosition)
    ]);
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex => vectorSubtract(vertex, cameraPosition)),
        edges: object.edges, 
        color: object.color || 'black'
    }));

    // Rotate camera around X-axis (pitch) and Y-axis (yaw)
    editablePoints = editablePoints.map(point => rotateY(rotateX(point, cameraPitch), cameraYaw));
    editableLines = editableLines.map(line => [
        rotateY(rotateX(line[0], cameraPitch), cameraYaw),
        rotateY(rotateX(line[1], cameraPitch), cameraYaw)
    ]);
    // Pitch and yaw the objects
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex => rotateY(rotateX(vertex, cameraPitch), cameraYaw)),
        edges: object.edges,
        color: object.color || 'black'
    }));

    // Project to 2D
    // Apply perspective projection
    editablePoints = editablePoints.map(point => applyPerspectiveProjection(point, FOV, aspectRatio));
    editableLines = editableLines.map(line => [
        applyPerspectiveProjection(line[0], FOV, aspectRatio),
        applyPerspectiveProjection(line[1], FOV, aspectRatio)
    ]);
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex => applyPerspectiveProjection(vertex, FOV, aspectRatio)),
        edges: object.edges, 
        color: object.color || 'black'
    }));


    // Map to canvas coordinates
    editablePoints = editablePoints.map(point => mapToCanvasCoordinates(point, width, height));
    editableLines = editableLines.map(line => [
        mapToCanvasCoordinates(line[0], width, height),
        mapToCanvasCoordinates(line[1], width, height)
    ]);
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex => mapToCanvasCoordinates(vertex, width, height)),
        edges: object.edges, 
        color: object.color || 'black'
    }));

    // Draw the projected points
    editablePoints.forEach(point => {
        drawCircle(point[0], point[1], 5, 'red', true);
    });
    // Draw the projected lines
    editableLines.forEach(line => {
        drawLine(line[0][0], line[0][1], line[1][0], line[1][1], 'white', 2);
    });
    // Draw the projected objects
    editableObjects.forEach(object => {
        object.edges.forEach(edge => {
            const start = object.vertices[edge[0]];
            const end = object.vertices[edge[1]];
            drawLine(start[0], start[1], end[0], end[1], object.color, 2);
        });
    });
}

render(testPoints, testLines, objects, cameraPosition);

// When the arrow keys are pressed, move the camera
document.addEventListener('keydown', (event) => {
    const step = 10; // Step size for camera movement
    switch (event.key) {
        case 'i':
            cameraPosition[1] -= step;
            break;
        case 'k':
            cameraPosition[1] += step;
            break;
        case 'ArrowLeft':
            cameraPosition[0] += step;
            break;
        case 'ArrowRight':
            cameraPosition[0] -= step;
            break;
        case 'ArrowUp': // Move forward
            cameraPosition[2] -= step;
            break;
        case 'ArrowDown': // Move backward
            cameraPosition[2] += step;
            break;
        case 'd': // Rotate left (yaw)
            cameraYaw -= 5;
            break;
        case 'a': // Rotate right (yaw)
            cameraYaw += 5;
            break;
        case 's': // Rotate up (pitch)
            cameraPitch -= 5;
            break;
        case 'w': // Rotate down (pitch)
            cameraPitch += 5;
            break;
    }
    render(testPoints, testLines, objects, cameraPosition);
});