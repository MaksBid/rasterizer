export type Vec3 = [number, number, number];
export type Vec2 = [number, number];
export type RenderType = 'point' | 'line' | 'triangle' | 'quad';
export type Matrix3x3 = [Vec3, Vec3, Vec3];
export type Line3D = [Vec3, Vec3]; // defined by two points in 3D space
export type Line2D = [Vec2, Vec2]; // defined by two points in 2D space
export type Triangle3D = [Vec3, Vec3, Vec3]; // defined by three points in 3D space
export type Triangle2D = [Vec2, Vec2, Vec2]; // defined by three points in 2D space
export type Quad3D = [Vec3, Vec3, Vec3, Vec3]; // defined by four points in 3D space
export type Quad2D = [Vec2, Vec2, Vec2, Vec2]; // defined by four points in 2D space
export type QueueItem = IPointItem | ILineItem | ITriangleItem | IQuadItem;

export interface IObject {
    vertices: Vec3[]; // Array of vertices in world coordinates
    edges: number[][]; // Array of edges, each edge is an array of two indices into the vertices array
    color: string; // Color of the object
    triangleMesh: Vec3[]; // Array of triangles, each triangle is an array of three indices into the vertices array
    triangleMeshColor: string; // Color for the triangle mesh (empty if not used)
}

export interface IScene {
    points: Vec3[]; // Array of points in world coordinates
    lines: Vec3[][]; // Array of lines, each line is an array of two points in world coordinates
    objects: IObject[]; // Array of objects, each object has vertices and edges
}

export interface IDisplaySettings {
    width: number; // Width of the canvas
    height: number; // Height of the canvas
    FOV: number; // Field of View in degrees
}

export interface ICamera {
    position: Vec3; // Camera position in world coordinates
    orientation: Matrix3x3; // Orientation matrix (3x3)
}

export interface IPointItem {
    type: 'point';
    screenCoordinates: Vec2; // 2D coordinates on the canvas
    depth: number;
    color: string; 
}

export interface ILineItem {
    type: 'line';
    screenCoordinates: Line2D; // 2D coordinates on the canvas
    depth: number;
    color: string; 
}

export interface ITriangleItem {
    type: 'triangle';
    screenCoordinates: Triangle2D; // 2D coordinates on the canvas
    depth: number;
    color: string; 
}

export interface IQuadItem {
    type: 'quad';
    screenCoordinates: Quad2D; // 2D coordinates on the canvas
    depth: number;
    color: string; 
}
