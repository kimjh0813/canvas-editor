export const measureTextWidth = (
  ctx: CanvasRenderingContext2D,
  text: string
) => {
  return Math.ceil(ctx.measureText(text).width);
};
