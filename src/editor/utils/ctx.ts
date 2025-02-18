export function measureTextWidth(ctx: CanvasRenderingContext2D, text: string) {
  return Math.ceil(ctx.measureText(text).width);
}

export function createCanvasElement() {
  return document.createElement("canvas").getContext("2d");
}
