import { drawLine, clear, drawTriangle, drawCircle } from './canvas.js';
import { applyPerspectiveProjection, mapToCanvasCoordinates, vectorSubtract } from './math.js';
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

    // Translate
    const translatedPoints = points.map(point => vectorSubtract(point, cameraPosition));
    const translatedLines = lines.map(line => [
        vectorSubtract(line[0], cameraPosition),
        vectorSubtract(line[1], cameraPosition)
    ]);
    const translatedObjects = objects.map(object => ({
        vertices: object.vertices.map(vertex => vectorSubtract(vertex, cameraPosition)),
        edges: object.edges, 
        color: object.color || 'black'
    }));

    // Project to 2D
    // Apply perspective projection
    const projectedPoints = translatedPoints.map(point => applyPerspectiveProjection(point, FOV, aspectRatio));
    const projectedLines = translatedLines.map(line => [
        applyPerspectiveProjection(line[0], FOV, aspectRatio),
        applyPerspectiveProjection(line[1], FOV, aspectRatio)
    ]);
    const projectedObjects = translatedObjects.map(object => ({
        vertices: object.vertices.map(vertex => applyPerspectiveProjection(vertex, FOV, aspectRatio)),
        edges: object.edges, 
        color: object.color || 'black'
    }));


    // Map to canvas coordinates
    const pointsOnCanvas = projectedPoints.map(point => mapToCanvasCoordinates(point, width, height));
    const linesOnCanvas = projectedLines.map(line => [
        mapToCanvasCoordinates(line[0], width, height),
        mapToCanvasCoordinates(line[1], width, height)
    ]);
    const objectsOnCanvas = projectedObjects.map(object => ({
        vertices: object.vertices.map(vertex => mapToCanvasCoordinates(vertex, width, height)),
        edges: object.edges, 
        color: object.color || 'black'
    }));

    // Draw the projected points
    pointsOnCanvas.forEach(point => {
        drawCircle(point[0], point[1], 5, 'red', true);
    });
    // Draw the projected lines
    linesOnCanvas.forEach(line => {
        drawLine(line[0][0], line[0][1], line[1][0], line[1][1], 'white', 2);
    });
    // Draw the projected objects
    objectsOnCanvas.forEach(object => {
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
        case 'ArrowUp':
            cameraPosition[1] -= step;
            break;
        case 'ArrowDown':
            cameraPosition[1] += step;
            break;
        case 'ArrowLeft':
            cameraPosition[0] += step;
            break;
        case 'ArrowRight':
            cameraPosition[0] -= step;
            break;
        case 'w': // Move forward
            cameraPosition[2] -= step;
            break;
        case 's': // Move backward
            cameraPosition[2] += step;
            break;
    }
    render(testPoints, testLines, objects, cameraPosition);
});