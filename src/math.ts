import type { Vec3, Vec2, Line3D, Triangle3D, Quad3D, ICamera, IDisplaySettings, Matrix3x3 } from './types/types.ts';

export function transpose3x3(matrix: Matrix3x3): Matrix3x3 {
    return [
        [matrix[0][0], matrix[1][0], matrix[2][0]],
        [matrix[0][1], matrix[1][1], matrix[2][1]],
        [matrix[0][2], matrix[1][2], matrix[2][2]]
    ]
}

export function vectorSubtract3D(v1: Vec3, v2: Vec3): Vec3 {
    return [
            v1[0] - v2[0],
            v1[1] - v2[1],
            v1[2] - v2[2]
        ];
}

export function multiplyMatrices3x3(m1: Matrix3x3, m2: Matrix3x3): Matrix3x3 {
    return [
            [
                m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0],
                m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1],
                m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2]
            ],
            [
                m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0],
                m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1],
                m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2]
            ],
            [
                m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0],
                m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1],
                m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2]
            ]
        ];
}

export function multiplyMatVec(matrix: Matrix3x3, vector: Vec3): Vec3 {
    return [
        matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
        matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
        matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]
    ];
}

export function applyTranslation(point: Vec3, translationVector: Vec3): Vec3 {
    // Works only for 3D vectors and Vec3 points
    return [
        point[0] + translationVector[0],
        point[1] + translationVector[1],
        point[2] + translationVector[2]
    ];
}

export function applyPerspectiveProjection(translatedPoint: Vec3, displaySettings: IDisplaySettings): Vec2 {    // Convert FOV to radians and calculate focal length
    const f = 1 / Math.tan((displaySettings.FOV * Math.PI) / 360);
    const aspectRatio = displaySettings.width / displaySettings.height;
    // Apply perspective projection
    return [
        translatedPoint[0] / translatedPoint[2] * f / aspectRatio,
        translatedPoint[1] / translatedPoint[2] * f
    ];
}

export function mapToCanvasCoordinates(point: Vec2, canvasWidth: number, canvasHeight: number): Vec2 {
    return [
        (1 - point[0]) * (canvasWidth / 2),
        (1 + point[1]) * (canvasHeight / 2)
    ];
}

export function yawRotationMatrix(delta: number): Matrix3x3 {
    const rad = (delta * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the Y-axis
        [cos, 0, -sin],
        [0, 1, 0],
        [sin, 0, cos]
    ];
}

export function pitchRotationMatrix(delta: number): Matrix3x3 {
    const rad = (delta * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the X-axis
        [1, 0, 0],
        [0, cos, -sin],
        [0, sin, cos]
    ];
}

export function isInFront(point: Vec3): boolean {
    // Check if the point's z is lower than zero
    // This assumes a right-handed coordinate system where the camera looks down the negative Z-axis
    if (point.length !== 3) {
        throw new Error('Point must be a 3D vector');
    }
    return point[2] < 0;
}

export function clipPoint(pointBehind: Vec3, pointInFront: Vec3, nearZ: number = -0.001): Vec3 {
    // This function assumes that camera-relative translation and rotation 
    // have already been applied to the points. 
    // So camera is at the origin (0, 0, 0) and looking down the negative Z-axis.

    // nearZ just slightly in front of the camera (negative Z goes into the scene)
    if (pointBehind.length !== 3 || pointInFront.length !== 3) {
        throw new Error('Both points must be 3D vectors');
    } else if (pointBehind[2] >= nearZ && pointInFront[2] >= nearZ) {
        throw new Error('Both points are in front of the near plane. No clipping needed.');
    } else if (pointBehind[2] < nearZ && pointInFront[2] < nearZ) {
        throw new Error('Both points are behind the near plane. Impossible to clip.');
    }

    if (pointBehind[2] < nearZ && pointInFront[2] >= nearZ) {
        // Only pointInFront is behind the near plane
        console.warn('Wrong point passed as behind point.');
        return pointBehind; 
    }

    // One point is in front and one is behind the near plane
    const t = (nearZ - pointBehind[2]) / (pointInFront[2] - pointBehind[2]);
    const clippedPoint: Vec3 = [
        pointBehind[0] + t * (pointInFront[0] - pointBehind[0]),
        pointBehind[1] + t * (pointInFront[1] - pointBehind[1]),
        nearZ
    ];

    return clippedPoint;
}


export function clipTriangle(points: Triangle3D): Vec3[] {
    // Assuming points are in camera coordinates (i.e., already translated and rotated)
    // console.log('Clipping triangle with points:', points);
    if (points.length !== 3) {
        throw new Error('clipTriangle requires exactly 3 points');
    }

    const indicesInFront: number[] = [];
    const indicesBehind: number[] = [];
    points.forEach((point, index) => {
        if (isInFront(point)) {
            indicesInFront.push(index);
        } else {
            indicesBehind.push(index);
        }
    });

    // Check if all points are in front of the camera
    switch (indicesInFront.length) {
        case 3:
            // All points are in front of the camera, no clipping needed
            throw new Error('All points are in front of the camera. No clipping needed.');
        case 0:
            // All points are behind the camera, no triangle to draw
            throw new Error('All points are behind the camera. No triangle to draw.');
        case 1:
            // One point is in front, two are behind
            // The result will be a triangle with one original point and two clipped
            const pointInFront = points[indicesInFront[0]]
            const clippedTriangle = [pointInFront];

            clippedTriangle.push(clipPoint(points[indicesBehind[0]], pointInFront));
            clippedTriangle.push(clipPoint(points[indicesBehind[1]], pointInFront));

            return clippedTriangle;
        case 2:
            // Two points are in front, one is behind
            // The result will be a quadrilateral with two original points and two new
            const pointBehind = points[indicesBehind[0]]
            const clippedQuad = [points[indicesInFront[0]], points[indicesInFront[1]]];

            clippedQuad.push(clipPoint(pointBehind, clippedQuad[0]));
            clippedQuad.push(clipPoint(pointBehind, clippedQuad[1]));

            return clippedQuad;
        default:
            throw new Error(`Unexpected number of points in front: ${indicesInFront.length}`);
    }
}

export function getPointOnCanvas(point: Vec3, displaySettings: IDisplaySettings): Vec2 {
    // Apply perspective projection
    const projectedPoint = applyPerspectiveProjection(point, displaySettings);
    
    // Map the projected point to canvas coordinates
    return mapToCanvasCoordinates(projectedPoint, displaySettings.width, displaySettings.height);
}

export function pointToCamera(point: Vec3, camera: ICamera): Vec3 {
    // Translate the point relative to the camera position
    const translatedPoint = vectorSubtract3D(point, camera.position);
    // Rotate the point using the orientation matrix
    const rotatedPoint = multiplyMatVec(transpose3x3(camera.orientation), translatedPoint);
    return rotatedPoint;
}