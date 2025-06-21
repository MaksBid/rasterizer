export const cube = {
    vertices: [
        [-20, -20, -20],
        [80, -20, -20],
        [80, 80, -20],
        [-20, 80, -20],
        [-20, -20, 80],
        [80, -20, 80],
        [80, 80, 80],
        [-20, 80, 80]
    ],
    edges: [
        [0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
        [4, 5], [5, 6], [6, 7], [7, 4], // Top face
        [0, 4], [1, 5], [2, 6], [3, 7] // Verticals
    ],
    color: 'blue',
    triangleMesh: [
        [0, 1, 2], [0, 2, 3], // Bottom face
        [4, 5, 6], [4, 6, 7], // Top face
        [0, 1, 5], [0, 5, 4], // Front face
        [1, 2, 6], [1, 6, 5], // Right face
        [2, 3, 7], [2, 7, 6], // Back face
        [3, 0, 4], [3, 4, 7] // Left face
    ],
    triangleMeshColor: '#000099' // Color for the triangle mesh
};
export const tetrahedron = {
    vertices: [
        [0, 100, 0],
        [-50, 0, -50],
        [50, 0, -50],
        [0, 0, 50]
    ],
    edges: [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
    ],
    color: 'green',
    // A tetrahedron has 4 triangular faces.
    triangleMesh: [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 2, 3]
    ],
    triangleMeshColor: '#008800'
};
export const octahedron = {
    vertices: [
        [0, 100, 0], // top (0)
        [0, -100, 0], // bottom (1)
        [-50, 0, 0], // equator (2)
        [50, 0, 0], // equator (3)
        [0, 0, -50], // equator (4)
        [0, 0, 50] // equator (5)
    ],
    edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
    ],
    color: 'purple',
    // We assume that the equator vertices form a cycle: 2 -> 4 -> 3 -> 5 -> 2.
    // Top faces: split the four triangles around the top vertex.
    // Bottom faces: do the same around the bottom vertex.
    triangleMesh: [
        // Top (vertex 0) faces
        [0, 2, 4],
        [0, 4, 3],
        [0, 3, 5],
        [0, 5, 2],
        // Bottom (vertex 1) faces -- note winding order can be adjusted as needed
        [1, 4, 2],
        [1, 3, 4],
        [1, 5, 3],
        [1, 2, 5]
    ],
    triangleMeshColor: '#880088'
};
export const triangularPrism = {
    vertices: [
        [0, 0, 0],
        [100, 0, 0],
        [50, 80, 0],
        [0, 0, 100],
        [100, 0, 100],
        [50, 80, 100]
    ],
    edges: [
        [0, 1], [1, 2], [2, 0], // front triangle
        [3, 4], [4, 5], [5, 3], // back triangle
        [0, 3], [1, 4], [2, 5] // verticals
    ],
    color: 'yellow',
    triangleMesh: [
        [0, 1, 2], // front triangle
        [3, 4, 5], // back triangle
        [1, 3, 0], // top face
        [1, 3, 4],
        [2, 4, 1], // bottom left face
        [2, 4, 5],
        [0, 5, 2], // bottom right face
        [0, 5, 3]
    ],
    triangleMeshColor: '#888800' // Color for the triangle mesh
};
export const pentagonalPrism = {
    vertices: [
        // front pentagon
        [0, 100, 0],
        [95, 31, 0],
        [59, -81, 0],
        [-59, -81, 0],
        [-95, 31, 0],
        // back pentagon
        [0, 100, 100],
        [95, 31, 100],
        [59, -81, 100],
        [-59, -81, 100],
        [-95, 31, 100]
    ],
    edges: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], // front pentagon
        [5, 6], [6, 7], [7, 8], [8, 9], [9, 5], // back pentagon
        [0, 5], [1, 6], [2, 7], [3, 8], [4, 9] // verticals
    ],
    color: 'orange',
    // Split the front and back pentagons into triangles (using vertex 0 and 5 respectively for triangulation),
    // and split each rectangular side face into two triangles.
    triangleMesh: [
        // Front face (pentagon): triangulate using vertex 0 as a pivot
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 4],
        // Back face (pentagon): triangulate using vertex 5 as a pivot
        [5, 6, 7],
        [5, 7, 8],
        [5, 8, 9],
        // Side faces: for each front edge, create two triangles with the corresponding back edge.
        // Side between vertices 0 and 1 (and 5 and 6)
        [0, 1, 6],
        [0, 6, 5],
        // Side between vertices 1 and 2 (and 6 and 7)
        [1, 2, 7],
        [1, 7, 6],
        // Side between vertices 2 and 3 (and 7 and 8)
        [2, 3, 8],
        [2, 8, 7],
        // Side between vertices 3 and 4 (and 8 and 9)
        [3, 4, 9],
        [3, 9, 8],
        // Side between vertices 4 and 0 (and 9 and 5)
        [4, 0, 5],
        [4, 5, 9]
    ],
    triangleMeshColor: '#885500'
};
