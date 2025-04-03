import { EditorManger } from "../core/EditorManger";
import { IBgSegment, IUlSegment } from "../types/draw";
import { ISelectRange } from "../types/selectRange";
import { ILineText } from "../types/text";

import { getFontStyle } from "./text";

interface DrawTextFragmentsParams {
  editorManger: EditorManger;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
  shouldUpdateText: boolean;
}

export function drawTextFragments({
  editorManger,
  canvasRefs,
  shouldUpdateText,
}: DrawTextFragmentsParams) {
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

      const isLastLine = page === lineTexts.size - 1 && i === value.length - 1;

      drawLine({
        ctx,
        lineText,
        selectRange: editorManger.select.selectRange,
        composingIndex: editorManger.text.isKoreanComposing
          ? editorManger.cursor.index - 1
          : undefined,
        isLastLine,
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
  isLastLine?: boolean;
}

function drawLine({
  lineText,
  ctx,
  selectRange,
  composingIndex,
  isLastLine,
}: DrawLineParams) {
  let lineX = lineText.x;
  const maxFontSize = lineText.maxFontSize;

  const bgSegments: IBgSegment[] = [];
  const ulSegments: IUlSegment[] = [];
  let selectStartX: number | null = null;
  let selectWidth = 0;

  const lineTextLength = lineText.text.length;
  const limit = isLastLine ? lineTextLength - 1 : lineTextLength;

  for (let i = 0; i < lineTextLength; i++) {
    const index = lineText.endIndex - lineTextLength + 1 + i;
    const { text, underline, backgroundColor, color, fontSize } =
      lineText.text[i];

    ctx.font = getFontStyle(lineText.text[i]);
    const textWidth = ctx.measureText(text).width;

    if (backgroundColor && text !== "\n" && i < limit) {
      addSegment(bgSegments, ["backgroundColor"], {
        backgroundColor,
        startX: lineX,
        endX: lineX + textWidth,
      });
    }

    if (selectRange && index >= selectRange.start && index < selectRange.end) {
      if (selectStartX === null) selectStartX = lineX;
      selectWidth += textWidth;
    }

    const isDrawUnderLine =
      composingIndex === index || (underline && text !== "\n");

    if (isDrawUnderLine && i < limit) {
      addSegment(ulSegments, ["color", "fontSize"], {
        color,
        fontSize,
        startX: lineX,
        endX: lineX + textWidth,
      });
    }

    lineX += textWidth;
  }

  drawTextBackground(ctx, bgSegments, lineText.y, maxFontSize);
  drawSelection(ctx, selectStartX, selectWidth, lineText.y, maxFontSize);
  drawText(ctx, lineText, maxFontSize);
  drawTextUnderLine(ctx, ulSegments, lineText.y, maxFontSize);
}

function addSegment<T extends { endX: number }>(
  segments: T[],
  keys: (keyof T)[],
  newSegment: T
) {
  if (
    segments.length > 0 &&
    keys.every((key) => segments[segments.length - 1][key] === newSegment[key])
  ) {
    segments[segments.length - 1].endX = newSegment.endX;
  } else {
    segments.push(newSegment);
  }
}

function drawTextBackground(
  ctx: CanvasRenderingContext2D,
  bgSegments: IBgSegment[],
  y: number,
  maxFontSize: number
) {
  if (bgSegments.length < 1) return;

  bgSegments.forEach(({ backgroundColor, startX, endX }) => {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(startX, y, Math.ceil(endX - startX), maxFontSize * 1.25);
  });
}

function drawSelection(
  ctx: CanvasRenderingContext2D,
  selectStartX: number | null,
  selectWidth: number,
  y: number,
  maxFontSize: number
) {
  if (selectStartX !== null) {
    ctx.fillStyle = "rgba(140, 174, 241, 0.5)";
    ctx.fillRect(selectStartX, y, selectWidth + 1, maxFontSize * 1.48);
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  lineText: ILineText,
  maxFontSize: number
) {
  let lineX = lineText.x;

  for (let i = 0; i < lineText.text.length; i++) {
    const textFragment = lineText.text[i];

    ctx.font = getFontStyle(textFragment);
    const textWidth = ctx.measureText(textFragment.text).width;

    ctx.fillStyle = textFragment.color;
    ctx.fillText(textFragment.text, lineX, lineText.y + maxFontSize);

    lineX += textWidth;
  }
}

function drawTextUnderLine(
  ctx: CanvasRenderingContext2D,
  ulSegments: IUlSegment[],
  y: number,
  maxFontSize: number
) {
  if (ulSegments.length < 1) return;

  ulSegments.forEach(({ color, startX, endX, fontSize }) => {
    const underlineY = y + maxFontSize * 0.1 + maxFontSize;

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.08));
    ctx.beginPath();
    ctx.moveTo(startX, underlineY);
    ctx.lineTo(endX, underlineY);
    ctx.stroke();
  });
}
