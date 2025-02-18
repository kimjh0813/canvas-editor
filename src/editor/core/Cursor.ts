import { ICursor } from "../../recoil";
import { ILineText } from "../types/text";
import { createCanvasElement, measureTextWidth } from "../utils/ctx";
import { EditorManger } from "./EditorManger";

export class Cursor {
  private _cursorIndex: number;

  private _setCursor: (cursor: ICursor) => void;

  constructor(
    private editor: EditorManger,
    setCursor: (cursor: ICursor) => void
  ) {
    this._cursorIndex = 0;
    this._setCursor = setCursor;
  }

  getCursorIndex() {
    return this._cursorIndex;
  }

  setCursor(cursor: ICursor) {
    this._setCursor(cursor);
  }

  resetCursorPosition(pageIndex?: number) {
    this._setCursor({
      x: this.editor.layout.marginX,
      y: this.editor.layout.marginY,
      fontSize: this.editor.layout.defaultFontSize,
      pageIndex: pageIndex ?? 0,
    });
  }

  setCursorIndex(cursorIndex: number, shouldUpdatePosition: boolean = true) {
    const textLength = this.editor.text.length();

    if (cursorIndex < 0 || textLength < cursorIndex) return;
    this._cursorIndex = cursorIndex;

    //just update index function because run setCursor from draw function
    if (!shouldUpdatePosition) return;

    const ctx = createCanvasElement();
    if (!ctx) return;

    const lineTextArr = this.editor.getLineTextArray();

    let targetLine: ILineText | null = null;
    let pageIndex = 0;

    if (this._cursorIndex > textLength - 1) {
      const lastPage = lineTextArr[lineTextArr.length - 1];
      targetLine = lastPage[lastPage.length - 1];
      pageIndex = lineTextArr.length - 1;
    } else {
      outerLoop: for (let p = 0; p < lineTextArr.length; p++) {
        for (let i = 0; i < lineTextArr[p].length; i++) {
          const lineText = lineTextArr[p][i];

          if (lineText.endIndex >= this._cursorIndex) {
            targetLine = lineText;
            pageIndex = p;
            break outerLoop;
          }
        }
      }
    }

    if (!targetLine) return;

    let x = targetLine.x;
    const textSliceIndex = Math.max(
      0,
      targetLine.text.length - (targetLine.endIndex - this._cursorIndex) - 1
    );

    targetLine.text.slice(0, textSliceIndex).forEach(({ fontSize, text }) => {
      ctx.font = `500 ${fontSize}px Arial`;
      x += measureTextWidth(ctx, text);
    });

    this._setCursor({
      x,
      y: targetLine.y,
      fontSize: targetLine.maxFontSize,
      pageIndex,
    });
  }
}
