import { TextFragment } from "./KeyboardHandler";

interface DrawTextParams {
  ctx: CanvasRenderingContext2D;
  textArr: (TextFragment | "enter")[];
  canvasWidth: number;
  marginX: number;
  marginY: number;
  defaultFontSize: number;
}

export function drawText({
  ctx,
  textArr,
  canvasWidth,
  marginX,
  marginY,
  defaultFontSize,
}: DrawTextParams) {
  let x = marginX;
  let y = marginY;
  let lineTexts: TextFragment[] = [];
  let maxFontSize = defaultFontSize;

  for (let i = 0; i < textArr.length; i++) {
    const t = textArr[i];

    if (t === "enter") {
      drawLine({ ctx, lineTexts, maxFontSize, marginX, y });

      y += maxFontSize * 1.2;
      x = marginX;
      lineTexts = [];
      maxFontSize = defaultFontSize;
      continue;
    }

    const { text, fontSize } = t;

    if (maxFontSize < fontSize) maxFontSize = fontSize;

    ctx.font = `500 ${fontSize}px Arial`;

    const textWidth = ctx.measureText(text).width;
    const currentWidth = x + marginX + textWidth;

    const isLastText = i === textArr.length - 1;
    if (currentWidth > canvasWidth) {
      drawLine({ ctx, lineTexts, maxFontSize, marginX, y });

      y += maxFontSize * 1.2;
      x = marginX;
      lineTexts = [];
      maxFontSize = defaultFontSize;
    }

    lineTexts.push({ text, fontSize });
    x += textWidth;

    if (isLastText) drawLine({ ctx, lineTexts, maxFontSize, marginX, y });
  }
}

interface DrawLineParams {
  ctx: CanvasRenderingContext2D;
  lineTexts: TextFragment[];
  maxFontSize: number;
  marginX: number;
  y: number;
}

function drawLine({ lineTexts, marginX, maxFontSize, ctx, y }: DrawLineParams) {
  let lineX = marginX;
  for (const lineText of lineTexts) {
    ctx.font = `500 ${lineText.fontSize}px Arial`;
    ctx.fillText(lineText.text, lineX, y + maxFontSize);
    lineX += ctx.measureText(lineText.text).width;
  }
}
