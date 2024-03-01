export const DRAW = {
    ctx: {
        circle: ({ ctx, x, y, style, label }: any) => {
            return {
                drawNode() {
                    ctx.strokeStyle = style.borderColor;
                    ctx.fillStyle = style.color;
                    ctx.lineWidth = style.borderWidth;
                    ctx.beginPath();
                    ctx.arc(x, y, style.size, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.font = '12px arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'black';

                    ctx.fillText(label, x, y);
                },
                drawExternalLabel() {},
                nodeDimensions: { width: 45, height: 45 },
            };
        },
        doubleCircle: ({ ctx, x, y, style, label }: any) => {
            return {
                drawNode() {
                    ctx.strokeStyle = style.borderColor;
                    ctx.fillStyle = style.color;
                    ctx.lineWidth = style.borderWidth;
                    ctx.beginPath();
                    ctx.arc(x, y, style.size, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(x, y, style.size - 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    if (label) {
                        ctx.font = '12px arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'black';

                        ctx.fillText(label, x, y);
                    }
                },
                drawExternalLabel() {},
                nodeDimensions: { width: 45, height: 45 },
            };
        },
        circleError: ({ ctx, x, y, style, label }: any) => {
            return {
                drawNode() {
                    ctx.strokeStyle = style.borderColor;
                    ctx.fillStyle = style.color;
                    ctx.lineWidth = style.borderWidth;
                    ctx.beginPath();
                    ctx.arc(x, y, style.size, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.font = '12px arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'black';

                    ctx.fillText(label, x, y);

                    ctx.fillStyle = 'red';

                    ctx.beginPath();
                    ctx.moveTo(x + 15, y + 15);
                    ctx.lineTo(x + 25, y + 15);
                    ctx.lineTo(x + 15, y + 25);
                    ctx.fill();
                    ctx.closePath();
                },
                drawExternalLabel() {},
                nodeDimensions: { width: 45, height: 45 },
            };
        },
        doubleCircleError: ({ ctx, x, y, style, label }: any) => {
            return {
                drawNode() {
                    ctx.strokeStyle = style.borderColor;
                    ctx.fillStyle = style.color;
                    ctx.lineWidth = style.borderWidth;
                    ctx.beginPath();
                    ctx.arc(x, y, style.size, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(x, y, style.size - 5, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.font = '12px arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'black';

                    ctx.fillText(label, x, y);

                    ctx.fillStyle = 'red';

                    ctx.beginPath();
                    ctx.moveTo(x + 15, y + 15);
                    ctx.lineTo(x + 25, y + 15);
                    ctx.lineTo(x + 15, y + 25);
                    ctx.fill();
                    ctx.closePath();
                },
                drawExternalLabel() {},
                nodeDimensions: { width: 45, height: 45 },
            };
        },
    },
};
