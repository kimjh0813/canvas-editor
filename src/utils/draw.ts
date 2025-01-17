import { SetterOrUpdater } from "recoil";
import { TextFragment } from "./KeyboardHandler";
import { Cursor } from "../recoil";

interface DrawTextParams {
  ctx: CanvasRenderingContext2D;
  textArr: TextFragment[];
  canvasWidth: number;
  marginX: number;
  marginY: number;
  defaultFontSize: number;
  setCursor: SetterOrUpdater<Cursor | undefined>;
}

export function drawText({
  ctx,
  textArr,
  canvasWidth,
  marginX,
  marginY,
  defaultFontSize,
  setCursor,
}: DrawTextParams) {
  let x = marginX;
  let y = marginY;
  let lineTexts: TextFragment[] = [];
  let maxFontSize = defaultFontSize;

  for (let i = 0; i < textArr.length; i++) {
    const t = textArr[i];

    const { text, fontSize } = t;

    if (maxFontSize < fontSize) maxFontSize = fontSize;

    ctx.font = `500 ${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    const currentWidth = x + marginX + textWidth;

    const isLastText = i === textArr.length - 1;

    if (currentWidth > canvasWidth && t.text !== "\n") {
      drawLine({ ctx, lineTexts, maxFontSize, marginX, y });

      y += maxFontSize * 1.48;
      x = marginX;
      lineTexts = [];
      maxFontSize = defaultFontSize;
    }

    lineTexts.push(t);
    x += textWidth;

    if (t.text === "\n") {
      drawLine({ ctx, lineTexts, maxFontSize, marginX, y });

      y += maxFontSize * 1.48;
      x = marginX;
      lineTexts = [];
      maxFontSize = defaultFontSize;
    }

    if (isLastText) {
      setCursor({ x, y, fontSize });
      drawLine({ ctx, lineTexts, maxFontSize, marginX, y });
    }
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

  for (let i = 0; i < lineTexts.length; i++) {
    const lineText = lineTexts[i];
    ctx.font = `500 ${lineText.fontSize}px Arial`;

    const textWidth = ctx.measureText(lineText.text).width;
    const textHeight = maxFontSize;

    if (lineText.isSelect) {
      ctx.fillStyle = "rgba(30, 144, 255, 0.15)";
      ctx.fillRect(lineX, y, textWidth, textHeight * 1.48);
    }

    ctx.fillStyle = "black";
    ctx.fillText(lineText.text, lineX, y + textHeight);

    lineX += textWidth;
  }
}
