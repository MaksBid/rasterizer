# Simple 3D Rasterizer

This project is a basic 3D graphics rasterizer implemented in JavaScript using the HTML5 Canvas API. It demonstrates fundamental concepts of 3D graphics, including vector and matrix mathematics, perspective projection, camera transformations, and object rendering.

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
    *   Basic near-plane clipping for lines to prevent rendering issues when objects are too close to or behind the camera.
*   **Real-time Updates**:
    *   Displays current camera position (X, Y, Z) and orientation matrix.
    *   Canvas resizes dynamically with the browser window.

## How to Run

1.  Ensure all project files (`index.html`, `app.js`, `canvas.js`, `math.js`, `exampleobjects.js`, `styles.css`) are in the same directory.
2.  Open the `index.html` file in a modern web browser that supports ES6 modules.

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

*   `index.html`: The main HTML file that sets up the canvas and loads the scripts.
*   `app.js`: Contains the main application logic, including the render loop, camera initialization, event handling for controls, and scene setup.
*   `canvas.js`: Provides utility functions for drawing on the HTML5 canvas (lines, circles, triangles).
*   `math.js`: Includes mathematical functions necessary for 3D graphics, such as vector operations (dot product, cross product, subtraction), matrix operations (multiplication, transpose), transformations (rotation, translation, perspective projection), and clipping.
*   `exampleobjects.js`: Defines sample 3D objects with their vertices, edges, and (for some) triangle meshes.
*   `styles.css`: Basic CSS for styling the page and canvas.

## Current Objects

The application currently renders:
*   Coordinate system axes with arrows.
*   A test point.
*   A triangular prism (as defined in `testObjects` in `app.js`). Other objects from `exampleobjects.js` can be added to this array for rendering.

---