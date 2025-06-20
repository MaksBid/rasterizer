export function dotProduct(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error('Vectors must be of the same length');
    }

    let result = 0;
    for (let i = 0; i < v1.length; i++) {
        result += v1[i] * v2[i];
    }
    return result;
}

export function crossProduct(v1, v2) {
    if (v1.length !== 3 || v2.length !== 3) {
        throw new Error('Cross product is only defined for 3-dimensional vectors');
    }

    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

export function transpose(matrix) {
    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
        throw new Error('Input must be a 2D array (matrix)');
    }
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function vectorSubtract(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error('Vectors must be of the same length');
    }

    return v1.map((value, index) => value - v2[index]);
}

export function multiplyMatrices(m1, m2) {
    if (m1[0].length !== m2.length) {
        throw new Error('Number of columns in first matrix must equal number of rows in second matrix');
    }

    // Handle the 3x3 case in a more optimized way
    if (m1.length === 3 && m1[0].length === 3 && m2.length === 3 && m2[0].length === 3) {
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

    // General case for any size matrices
    const result = Array.from({ length: m1.length }, () => Array(m2[0].length).fill(0));

    for (let i = 0; i < m1.length; i++) {
        for (let j = 0; j < m2[0].length; j++) {
            for (let k = 0; k < m1[0].length; k++) {
                result[i][j] += m1[i][k] * m2[k][j];
            }
        }
    }

    return result;
}

export function multiplyMatVec(matrix, vector) {
    if (matrix[0].length !== vector.length) {
        throw new Error('Matrix columns must match vector length');
    }

    // Handle the 3x3 case in a more optimized way
    if (matrix.length === 3 && matrix[0].length === 3 && vector.length === 3) {
        return [
            matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
            matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
            matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]
        ];
    }

    // General case for any size matrix and vector
    const result = Array(matrix.length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < vector.length; j++) {
            result[i] += matrix[i][j] * vector[j];
        }
    }
    return result;
}

export function applyTranslation(point, translationVector) {
    if (point.length !== translationVector.length) {
        throw new Error('Point and translation vector must be of the same length');
    }

    return point.map((value, index) => value + translationVector[index]);
}

export function applyTransformation(point, transformationMatrix) {
    if (point.length !== transformationMatrix.length || transformationMatrix.some(row => row.length !== point.length)) {
        throw new Error('Point and transformation matrix dimensions do not match');
    }

    const result = Array(transformationMatrix.length).fill(0);
    for (let i = 0; i < transformationMatrix.length; i++) {
        for (let j = 0; j < point.length; j++) {
            result[i] += transformationMatrix[i][j] * point[j];
        }
    }
    return result;
}

export function applyPerspectiveProjection(translatedPoint, fov, aspectRatio) {    // Convert FOV to radians and calculate focal length
    const f = 1 / Math.tan((fov * Math.PI) / 360);

    // Apply perspective projection
    return [
        translatedPoint[0] / translatedPoint[2] * f / aspectRatio,
        translatedPoint[1] / translatedPoint[2] * f
    ];
}

export function mapToCanvasCoordinates(point, canvasWidth, canvasHeight) {
    return [
        (1 - point[0]) * (canvasWidth / 2),
        (1 + point[1]) * (canvasHeight / 2)
    ];
}

export function rotateX(point, angle) {
    // You'd have to do this by multiplying a vector by a rotation matrix,
    // but for simplicity, we'll just apply the rotation directly
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the X-axis
        point[0],
        point[1] * cos - point[2] * sin,
        point[1] * sin + point[2] * cos
    ];
}

export function rotateY(point, angle) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the Y-axis
        point[0] * cos - point[2] * sin,
        point[1],
        point[0] * sin + point[2] * cos
    ];
}

export function rotateZ(point, angle) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the Z-axis
        point[0] * cos - point[1] * sin,
        point[0] * sin + point[1] * cos,
        point[2]
    ];
}

export function yawRotationMatrix(delta) {
    const rad = (delta * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the Y-axis
        [cos, 0, -sin],
        [0, 1, 0],
        [sin, 0, cos]
    ];
}

export function pitchRotationMatrix(delta) {
    const rad = (delta * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return [ // Clockwise rotation around the X-axis
        [1, 0, 0],
        [0, cos, -sin],
        [0, sin, cos]
    ];
}

export function isInFront(point) {
    // Check if the point's z is lower than zero
    // This assumes a right-handed coordinate system where the camera looks down the negative Z-axis
    if (point.length !== 3) {
        throw new Error('Point must be a 3D vector');
    }
    return point[2] < 0;
}

export function clipPoint(pointBehind, pointInFront, nearZ = -0.001) {
    // This function assumes that camera-relative translation and rotation 
    // have already been applied to the points. 
    // So camera is at the origin (0, 0, 0) and looking down the negative Z-axis.

    // nearZ just slightly in front of the camera (negative Z goes into the scene)
    if (pointBehind.length !== 3 || pointInFront.length !== 3) {
        throw new Error('Both points must be 3D vectors');
    }

    // Clip the line segment defined by pointBehind and pointInFront against the near plane
    if (pointBehind[2] >= nearZ && pointInFront[2] >= nearZ) {
        console.warn('Both points are behind the near plane. Clipping will not be performed.');
        return null; 
    }

    if (pointBehind[2] < nearZ && pointInFront[2] < nearZ) {
        console.warn('Both points are in front of the near plane. No clipping needed.');
        return pointBehind; 
    }

    if (pointBehind[2] < nearZ && pointInFront[2] >= nearZ) {
        // Only pointInFront is behind the near plane
        console.warn('Wrong point passed as behind point.');
        return pointBehind; 
    }

    // One point is in front and one is behind the near plane
    const t = (nearZ - pointBehind[2]) / (pointInFront[2] - pointBehind[2]);
    const clippedPoint = [
        pointBehind[0] + t * (pointInFront[0] - pointBehind[0]),
        pointBehind[1] + t * (pointInFront[1] - pointBehind[1]),
        nearZ
    ];

    return clippedPoint;
}


export function clipTriangle(points) {
    // Assuming points are in camera coordinates (i.e., already translated and rotated)
    // console.log('Clipping triangle with points:', points);
    if (points.length !== 3) {
        throw new Error('clipTriangle requires exactly 3 points');
    }

    const indicesInFront = [];
    const indicesBehind = [];
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

export function getPointOnCanvas(point, displaySettings) {
    // Apply perspective projection
    const aspectRatio = displaySettings.width / displaySettings.height;
    const projectedPoint = applyPerspectiveProjection(point, displaySettings.FOV, aspectRatio);
    
    // Map the projected point to canvas coordinates
    return mapToCanvasCoordinates(projectedPoint, displaySettings.width, displaySettings.height);
}

export function pointToCamera(point, camera) {
    // Translate the point relative to the camera position
    const translatedPoint = vectorSubtract(point, camera.position);
    // Rotate the point using the orientation matrix
    const rotatedPoint = multiplyMatVec(transpose(camera.orientation), translatedPoint);
    return rotatedPoint;
}