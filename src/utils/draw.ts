import { LineText, SelectRange } from "../types/editor";
import { measureTextWidth } from "./ctx";
import { EditorManger } from "./EditorManger";

interface DrawTextParams {
  editorManger: EditorManger;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
  shouldUpdateText: boolean;
}

export function drawText({
  editorManger,
  canvasRefs,
  shouldUpdateText,
}: DrawTextParams) {
  // const start = performance.now();
  const lineTexts = editorManger.getCanvasData(shouldUpdateText);

  // const end = performance.now();
  // console.log(`get lineTexts 함수 실행 시간: ${(end - start).toFixed(2)}ms`);

  if (!lineTexts) return;

  const canvasArr = canvasRefs.current;

  for (const canvas of canvasArr) {
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) break;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // TODO:drawLine 최적화 필요
  // const start1 = performance.now();

  for (const [page, value] of lineTexts) {
    for (let i = 0; i < value.length; i++) {
      const lineText = value[i];
      const canvas = canvasArr[page];
      const ctx = canvas?.getContext("2d");

      if (!ctx) return;

      drawLine({
        ctx,
        lineText,
        selectRange: editorManger.selectRange,
        composingIndex: editorManger.isKoreanComposing
          ? editorManger.cursorIndex - 1
          : undefined,
      });
    }
  }

  // const end1 = performance.now();
  // console.log(`drawLine 함수 실행 시간: ${(end1 - start1).toFixed(2)}ms`);
}

interface DrawLineParams {
  ctx: CanvasRenderingContext2D;
  lineText: LineText;
  selectRange: SelectRange | null;
  composingIndex?: number;
}
function drawLine({
  lineText,
  ctx,
  selectRange,
  composingIndex,
}: DrawLineParams) {
  let lineX = lineText.x;

  for (let i = 0; i < lineText.text.length; i++) {
    const index = lineText.endIndex - lineText.text.length + 1 + i;
    const { fontSize, text } = lineText.text[i];

    ctx.font = `400 ${fontSize}px Arial`;

    const textWidth = measureTextWidth(ctx, text);
    const textHeight = lineText.maxFontSize;

    // ctx.fillStyle = "green";
    // ctx.fillRect(lineX, lineText.y, textWidth, textHeight * 1.48);

    //draw select
    if (selectRange && index >= selectRange.start && index < selectRange.end) {
      ctx.fillStyle = "#B2CEF9";
      ctx.fillRect(lineX, lineText.y, textWidth, textHeight * 1.48);
    }

    //draw text
    ctx.fillStyle = "black";
    ctx.fillText(text, lineX, lineText.y + textHeight);

    //draw isComposing
    if (composingIndex === index) {
      const underlineY = lineText.y + textHeight * 1.2;
      drawTextUnderLine({ ctx, underlineY, lineX, textWidth });
    }

    lineX += textWidth;
  }
}

interface DrawTextUnderLine {
  ctx: CanvasRenderingContext2D;
  underlineY: number;
  lineX: number;
  textWidth: number;
}
function drawTextUnderLine({
  ctx,
  underlineY,
  lineX,
  textWidth,
}: DrawTextUnderLine) {
  ctx.beginPath();
  ctx.moveTo(lineX, underlineY);
  ctx.lineTo(lineX + textWidth, underlineY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.stroke();
}
