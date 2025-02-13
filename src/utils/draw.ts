import { LineText, SelectRange } from "../types/editor";
import { measureTextWidth } from "./ctx";
import { EditorManger } from "./EditorManger";

interface DrawTextParams {
  editorManger: EditorManger;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
  shouldUpdateText: boolean;
}

export function drawText({ editorManger, canvasRefs }: DrawTextParams) {
  const lineTexts = editorManger.getCanvasData();
export function drawText({
  editorManger,
  canvasRefs,
  shouldUpdateText,
}: DrawTextParams) {
  const lineTexts = editorManger.getCanvasData(shouldUpdateText);

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

      drawLine({
        ctx,
        lineTexts: value[i],
        selectRange: editorManger.selectRange,
      });
    }
  }
}

interface DrawLineParams {
  ctx: CanvasRenderingContext2D;
  selectRange: SelectRange | null;
  lineTexts: LineText;
}
function drawLine({ lineTexts, ctx, selectRange }: DrawLineParams) {
  let lineX = lineTexts.x;

  for (let i = 0; i < lineTexts.text.length; i++) {
    const index = lineTexts.endIndex - lineTexts.text.length + 1 + i;
    const lineText = lineTexts.text[i];

    ctx.font = `400 ${lineText.fontSize}px Arial`;

    const textWidth = measureTextWidth(ctx, lineText.text);
    const textHeight = lineTexts.maxFontSize;

    // ctx.fillStyle = "green";
    // ctx.fillRect(lineX, lineTexts.y, textWidth, textHeight * 1.48);

    if (selectRange && index >= selectRange.start && index < selectRange.end) {
      ctx.fillStyle = "#B2CEF9";
      ctx.fillRect(lineX, lineTexts.y, textWidth, textHeight * 1.48);
    }

    ctx.fillStyle = "black";
    ctx.fillText(lineText.text, lineX, lineTexts.y + textHeight);

    lineX += textWidth;
  }
}
