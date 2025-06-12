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
    return point[2] <= 0;
}

export function clipPoint(pointBehind, pointInFront, nearZ = -0.1) {
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

export function getPointOnCanvas(point, displaySettings) {
    // Check if the point is in front of the camera
    if (!isInFront(point)) {
        throw new Error(`Point ${point} is behind the camera and cannot be projected.`);
    }

    // Apply perspective projection
    const aspectRatio = displaySettings.width / displaySettings.height;
    const projectedPoint = applyPerspectiveProjection(point, displaySettings.FOV, aspectRatio);
    
    // Map the projected point to canvas coordinates
    return mapToCanvasCoordinates(projectedPoint, displaySettings.width, displaySettings.height);
}

export function pointToCamera(point, cameraPosition, cameraOrientation) {
    // Translate the point relative to the camera position
    const translatedPoint = vectorSubtract(point, cameraPosition);
    // Rotate the point using the orientation matrix
    const rotatedPoint = multiplyMatVec(transpose(cameraOrientation), translatedPoint);
    return rotatedPoint;
}