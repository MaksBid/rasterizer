# Simple 3D Rasterizer

This project is a basic 3D graphics rasterizer implemented in TypeScript using the HTML5 Canvas API. It demonstrates fundamental concepts of 3D graphics, including vector and matrix mathematics, perspective projection, camera transformations, and object rendering.

## Features

*   **3D Object Rendering**:
    *   Wireframe rendering of predefined objects (cubes, tetrahedrons, etc.).
    *   Basic filled triangle mesh rendering for supported objects.
*   **Camera System**:
    *   Movable camera with translation (forward/backward, left/right, up/down).
    *   Rotatable camera with yaw (left/right) and pitch (up/down) controls.
    *   Perspective projection to simulate 3D depth on a 2D screen.
*   **Transformations**:
    *   Object vertices are transformed from world space to camera space, then to screen space.
    *   Rotation and translation matrices are used for camera and object manipulation.
*   **Clipping**:
    *   Basic near-plane clipping for lines and triangles to prevent rendering issues when objects are too close to or behind the camera.
*   **Real-time Updates**:
    *   Displays current camera position (X, Y, Z) and orientation matrix.
    *   Canvas resizes dynamically with the browser window.

## How to Run

1.  Ensure you have Node.js and TypeScript installed (`npm install -g typescript`).
2.  Clone the repository or copy the project files.
3.  Navigate to the project directory (`D:\stuff\js\rasterizer`) and run `tsc` to compile the TypeScript files from the `src` directory to the `dist` directory.
4.  Open the `index.html` file in a modern web browser that supports ES6 modules. The compiled JavaScript files in the `dist` directory will be loaded.

## Controls

*   **Camera Movement**:
    *   `ArrowUp`: Move camera forward (along its local Z-axis).
    *   `ArrowDown`: Move camera backward (along its local Z-axis).
    *   `ArrowLeft`: Strafe camera left (along its local X-axis).
    *   `ArrowRight`: Strafe camera right (along its local X-axis).
    *   `i`: Move camera up (along the global Y-axis).
    *   `k`: Move camera down (along the global Y-axis).
*   **Camera Rotation**:
    *   `a`: Yaw camera left.
    *   `d`: Yaw camera right.
    *   `w`: Pitch camera up.
    *   `s`: Pitch camera down.

## Project Structure

*   `index.html`: The main HTML file that sets up the canvas and loads the compiled JavaScript scripts from the `dist` directory.
*   `src/app.ts`: Contains the main application logic, including the render loop, camera initialization, event handling for controls, and scene setup.
*   `src/canvas.ts`: Provides utility functions for drawing on the HTML5 canvas (lines, circles, triangles).
*   `src/math.ts`: Includes mathematical functions necessary for 3D graphics, such as vector operations (subtraction), matrix operations (multiplication, transpose), transformations (rotation, translation, perspective projection), and clipping.
*   `src/exampleobjects.ts`: Defines sample 3D objects with their vertices, edges, and triangle meshes.
*   `src/types/types.ts`: Defines TypeScript interfaces and types for vectors, matrices, objects, scenes, and rendering items.
*   `dist/`: Contains the compiled JavaScript files (`app.js`, `canvas.js`, `math.js`, `exampleobjects.js`, `types/types.js`) generated from the TypeScript sources using the TypeScript compiler (`tsc`).
*   `tsconfig.json`: Configuration file for the TypeScript compiler, specifying the input (`src`) and output (`dist`) directories, along with other compilation settings.
*   `styles.css`: Basic CSS for styling the page and canvas.

## Current Objects

The application currently renders:
*   Coordinate system axes with arrows.
*   A test point.
*   A triangular prism (as defined in `testObjects` in `app.ts`). Other objects from `exampleobjects.ts` can be added to this array for rendering.

## Notes

* The project has been migrated from plain JavaScript to TypeScript to improve type safety and maintainability.
* The TypeScript source files are located in the `src` directory, and the compiled JavaScript files are output to the `dist` directory.
* The `types.ts` file provides type definitions for the 3D rendering system, ensuring proper type checking during development.