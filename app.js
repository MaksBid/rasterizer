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

function render(points, lines, objects, cameraPosition = [0, 0, 200], canvasWidth = width, canvasHeight = height) {
    clear();

    let editablePoints = points.map(point => [...point]);
    let editableLines = lines.map(line => line.map(point => [...point]));
    let editableObjects = objects.map(object => ({
        vertices: object.vertices.map(vertex => [...vertex]),
        edges: object.edges,
        color: object.color || 'black',
        triangleMesh: object.triangleMesh,
        triangleMeshColor: object.triangleMeshColor || 'black'
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
        color: object.color || 'black',
        triangleMesh: object.triangleMesh,
        triangleMeshColor: object.triangleMeshColor || 'black'
    }));

    // Rotate around the camera
    editablePoints = editablePoints.map(point => 
        multiplyMatVec(transpose(orientationMatrix), point)
    )
    editableLines = editableLines.map(line => [
        multiplyMatVec(transpose(orientationMatrix), line[0]),
        multiplyMatVec(transpose(orientationMatrix), line[1])
    ]);
    // Rotate objects
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex =>
            multiplyMatVec(transpose(orientationMatrix), vertex)
        ),
        edges: object.edges,
        color: object.color || 'black',
        triangleMesh: object.triangleMesh,
        triangleMeshColor: object.triangleMeshColor || 'black'
    }));

    // Filter out points that are behind the camera
    editablePoints = editablePoints.filter(point => isInFront(point));
    // One point of a line must be in front of the camera for the line to be drawn
    editableLines = editableLines.filter(line => isInFront(line[0]) && isInFront(line[1]));
    editableObjects.forEach(object => {
        // Remove edges that connect to vertices that are behind the camera
        object.edges = object.edges.filter(edge => isInFront(object.vertices[edge[0]]) && isInFront(object.vertices[edge[1]]));
        object.vertices = object.vertices.filter(vertex => isInFront(vertex));
        // object.triangleMesh = object.triangleMesh;
    });

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
        color: object.color || 'black',
        triangleMesh: object.triangleMesh,
        triangleMeshColor: object.triangleMeshColor || 'black'
    }));


    // Map to canvas coordinates
    editablePoints = editablePoints.map(point => mapToCanvasCoordinates(point, canvasWidth, canvasHeight));
    editableLines = editableLines.map(line => [
        mapToCanvasCoordinates(line[0], canvasWidth, canvasHeight),
        mapToCanvasCoordinates(line[1], canvasWidth, canvasHeight)
    ]);
    editableObjects = editableObjects.map(object => ({
        vertices: object.vertices.map(vertex => mapToCanvasCoordinates(vertex, canvasWidth, canvasHeight)),
        edges: object.edges, 
        color: object.color || 'black',
        triangleMesh: object.triangleMesh,
        triangleMeshColor: object.triangleMeshColor || 'black'
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
    // Draw the triangle mesh if it exists
    editableObjects.forEach(object => {
        if (object.triangleMesh) {
            object.triangleMesh.forEach(triangle => {
                const points = triangle.map(index => object.vertices[index]);
                drawTriangle(points, object.triangleMeshColor);
            });
        }
    });
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
            orientationMatrix = multiplyMatrices(yawRotationMatrix(5), orientationMatrix); // Rotate right by 5 degrees
            break;
        case 'a': // Rotate left (yaw)
            orientationMatrix = multiplyMatrices(yawRotationMatrix(-5), orientationMatrix); // Rotate left by 5 degrees
            break;
        case 'w': // Rotate up (pitch)
            orientationMatrix = multiplyMatrices(orientationMatrix, pitchRotationMatrix(5)); // Rotate down by 5 degrees
            break;
        case 's': // Rotate down (pitch)
            orientationMatrix = multiplyMatrices(orientationMatrix, pitchRotationMatrix(-5), ); // Rotate up by 5 degrees
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