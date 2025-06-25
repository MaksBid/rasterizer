import type { Vec3, IObject } from "./types/types";
export function parseObj(obj: string, scale: number): IObject {
    const lines = obj.split('\n');
    const vertices: Vec3[] = [];
    const triangleMesh: Vec3[] = [];
    const edges: number[][] = [];

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') { // Vertex definition
            vertices.push([
                parseFloat(parts[1]) * scale, // Scale the vertex coordinates
                parseFloat(parts[2]) * scale,
                parseFloat(parts[3]) * scale
            ]);
        }
        else if (parts[0] === 'f') { // Face definition
            const indices = parts.slice(1).map(part => {
                // f i/j/k we only need the vertex index, texture and normal indices are ignored
                const i = part.split('/')[0];
                return parseInt(i, 10) - 1; // Convert to zero-based index (obj are 1-based)
            });

            if (indices.length === 3) {
                triangleMesh.push([indices[0], indices[1], indices[2]]);
            } else if (indices.length === 4) {
                // If it's a quad, split it into two triangles
                triangleMesh.push([indices[0], indices[1], indices[2]]);
                triangleMesh.push([indices[0], indices[2], indices[3]]);
            }

            // Compute the edges for the wireframe
            for (let i = 0; i < indices.length; i++) {
                const start = indices[i];
                const end = indices[(i + 1) % indices.length];
                edges.push([start, end]);
            }
        }
    }
    return {
        vertices,
        edges,
        color: 'white', // Default color, can be changed later
        triangleMesh,
        triangleMeshColor: '#888888' // Default color for the triangle mesh
    }
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);      // UTF-8 by default
  });
}