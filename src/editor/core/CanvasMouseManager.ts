import { ILineText } from "../types/text";
import { measureTextWidth } from "../utils/ctx";
import { EditorManger } from "./EditorManger";

export class CanvasMouseManager {
  constructor(private editor: EditorManger) {}

  getTargetIndex(clickX: number, clickY: number, lineTextArr: ILineText[]) {
    let closestLine: ILineText | null = null;
    let isLastLine = false;

    for (let i = 0; i < lineTextArr.length; i++) {
      const line = lineTextArr[i];
      if (clickY >= line.y && clickY <= line.y + line.maxFontSize * 1.48) {
        closestLine = line;
        i === lineTextArr.length - 1 && (isLastLine = true);
        break;
      }
    }

    if (!closestLine) return;

    let x = closestLine.x;
    let cursorIndex: number | null = null;

    for (let i = 0; i < closestLine.text.length; i++) {
      const { text, fontSize } = closestLine.text[i];

      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `500 ${fontSize}px Arial`;

      const textWidth = measureTextWidth(ctx, text);
      const charMid = x + textWidth / 2;

      if (clickX >= x && clickX <= x + textWidth) {
        if (clickX < charMid) {
          cursorIndex =
            closestLine.endIndex - (closestLine.text.length - i) + 1;
        } else {
          cursorIndex =
            closestLine.endIndex - (closestLine.text.length - i) + 1 + 1;
        }
        break;
      }

      x += textWidth;
    }

    if (cursorIndex === null) {
      if (clickX > this.editor.layout.marginX) {
        // 마지막 줄일 경우 +1
        cursorIndex = isLastLine
          ? closestLine.endIndex + 1
          : closestLine.endIndex;
      } else {
        cursorIndex = closestLine.endIndex - closestLine.text.length + 1;
      }
    }

    return cursorIndex;
  }

  down(clickX: number, clickY: number, pageIndex: number) {
    this.editor.select.clearSelectedRange();
    this.editor.text.resetKoreanComposing();

    console.log(this.editor.getLineTextArray());
    console.log(this.editor.cursor.index);

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const lineTextArr = this.editor.lineTexts.get(pageIndex);

    if (!lineTextArr || lineTextArr.length === 0) {
      this.editor.cursor.resetCursorPosition(pageIndex);
      return;
    }

    const lastLine = lineTextArr[lineTextArr.length - 1];

    if (lastLine.y + lastLine.maxFontSize * 1.48 < clickY) {
      this.editor.cursor.setCursorIndex(this.editor.text.length());
      return;
    }

    const targetIndex = this.getTargetIndex(clickX, clickY, lineTextArr);

    if (targetIndex === undefined) return;

    this.editor.cursor.setCursorIndex(targetIndex);
  }
}
