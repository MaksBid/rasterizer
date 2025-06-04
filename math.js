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
        (point[0] + 1) * (canvasWidth / 2),
        (1 - point[1]) * (canvasHeight / 2)
    ];
}