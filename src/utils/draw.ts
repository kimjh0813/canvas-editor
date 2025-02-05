import { LineText } from "../types/editor";
import { EditorManger } from "./EditorManger";

interface DrawTextParams {
  editorManger: EditorManger;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
}

export function drawText({ editorManger, canvasRefs }: DrawTextParams) {
  const lineTexts = editorManger.getCanvasData();

  if (!lineTexts) return;

  const canvasArr = canvasRefs.current;

  for (const canvas of canvasArr) {
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) break;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  for (const [page, value] of lineTexts) {
    for (let i = 0; i < value.length; i++) {
      const canvas = canvasArr[page];
      const ctx = canvas?.getContext("2d");

      if (!ctx) return;

      drawLine({ ctx, lineTexts: value[i] });
    }
  }
}

interface DrawLineParams {
  ctx: CanvasRenderingContext2D;
  lineTexts: LineText;
}
function drawLine({ lineTexts, ctx }: DrawLineParams) {
  let lineX = lineTexts.x;

  for (let i = 0; i < lineTexts.text.length; i++) {
    const lineText = lineTexts.text[i];
    ctx.font = `500 ${lineText.fontSize}px Arial`;

    const textWidth = ctx.measureText(lineText.text).width;
    const textHeight = lineTexts.maxFontSize;

    if (lineText.isSelect) {
      ctx.fillStyle = "rgba(30, 144, 255, 0.15)";
      ctx.fillRect(lineX, lineTexts.y, textWidth, textHeight * 1.48);
    }

    ctx.fillStyle = "black";
    ctx.fillText(lineText.text, lineX, lineTexts.y + textHeight);

    lineX += textWidth;
  }
}
