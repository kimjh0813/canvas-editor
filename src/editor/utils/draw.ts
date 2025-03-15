import { EditorManger } from "../core/EditorManger";
import { ISelectRange } from "../types/selectRange";
import { ILineText } from "../types/text";

import { getFontStyle } from "./text";

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
  const lineTexts =
    editorManger.getLineTextsFormTextFragments(shouldUpdateText);

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
        selectRange: editorManger.select.selectRange,
        composingIndex: editorManger.text.isKoreanComposing
          ? editorManger.cursor.index - 1
          : undefined,
      });
    }
  }

  // const end1 = performance.now();
  // console.log(`drawLine 함수 실행 시간: ${(end1 - start1).toFixed(2)}ms`);
}

interface DrawLineParams {
  ctx: CanvasRenderingContext2D;
  lineText: ILineText;
  selectRange: ISelectRange | null;
  composingIndex?: number;
}
function drawLine({
  lineText,
  ctx,
  selectRange,
  composingIndex,
}: DrawLineParams) {
  let lineX = lineText.x;
  const maxFontSize = lineText.maxFontSize;

  let selectStartX: number | null = null;
  let selectWidth = 0;

  for (let i = 0; i < lineText.text.length; i++) {
    const index = lineText.endIndex - lineText.text.length + 1 + i;
    const textFragment = lineText.text[i];

    ctx.font = getFontStyle(textFragment);
    const textWidth = ctx.measureText(textFragment.text).width;

    //draw background
    if (textFragment.backgroundColor && textFragment.text !== "\n") {
      ctx.fillStyle = textFragment.backgroundColor;
      ctx.fillRect(lineX, lineText.y, textWidth + 1, maxFontSize * 1.2);
    }

    if (selectRange && index >= selectRange.start && index < selectRange.end) {
      if (selectStartX === null) selectStartX = lineX;
      selectWidth += textWidth;
    }

    lineX += textWidth;
  }

  // draw select
  if (selectStartX) {
    ctx.fillStyle = "rgba(140, 174, 241, 0.5)";
    ctx.fillRect(selectStartX, lineText.y, selectWidth + 1, maxFontSize * 1.48);
  }

  lineX = lineText.x;

  for (let i = 0; i < lineText.text.length; i++) {
    const index = lineText.endIndex - lineText.text.length + 1 + i;
    const textFragment = lineText.text[i];

    ctx.font = getFontStyle(textFragment);
    const textWidth = ctx.measureText(textFragment.text).width;

    //draw text
    ctx.fillStyle = textFragment.color;
    ctx.fillText(textFragment.text, lineX, lineText.y + maxFontSize);

    const isDrawUnderLine =
      composingIndex === index ||
      (textFragment.underline && textFragment.text !== "\n");

    //draw isComposing
    if (isDrawUnderLine) {
      const underlineY = lineText.y + maxFontSize * 0.1 + maxFontSize;
      drawTextUnderLine({
        ctx,
        underlineY,
        lineX,
        textWidth: textWidth + 1,
        fontSize: textFragment.fontSize,
        color: textFragment.color,
      });
    }

    lineX += textWidth;
  }
}

interface DrawTextUnderLine {
  ctx: CanvasRenderingContext2D;
  underlineY: number;
  lineX: number;
  textWidth: number;
  fontSize: number;
  color: string;
}
function drawTextUnderLine({
  ctx,
  underlineY,
  lineX,
  textWidth,
  fontSize,
  color,
}: DrawTextUnderLine) {
  ctx.beginPath();
  ctx.moveTo(lineX, underlineY);
  ctx.lineTo(lineX + textWidth, underlineY);
  ctx.lineWidth = Math.max(1, fontSize * 0.08);
  ctx.strokeStyle = color;
  ctx.stroke();
}
