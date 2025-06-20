const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export function drawLine(x1, y1, x2, y2, color = 'black', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

export function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawCircle(x, y, radius, color = 'black', fill = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

export function drawTriangle(points, color = 'black', width = 1) {
    if (points.length !== 3) {
        throw new Error('drawTriangle requires exactly 3 points');
    }

    // Draw a filled triangle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.closePath();
    ctx.fill();
}

export function drawQuad(points, color = 'black', width = 1) {
    if (points.length !== 4) {
        throw new Error('drawQuad requires exactly 4 points');
    }
    if (points.some(point => point.length !== 2)) {
        throw new Error('Each point in drawQuad must be a 2D coordinate');
    }

    // Draw a filled quad
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.lineTo(points[3][0], points[3][1]);
    ctx.closePath();
    ctx.fill();
}