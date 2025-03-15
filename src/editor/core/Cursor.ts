import { ICursor } from "../../recoil";
import { ILineText } from "../types/text";
import { createCanvasElement } from "../utils/ctx";
import { getFontStyle } from "../utils/text";
import { EditorManger } from "./EditorManger";

export class Cursor {
  private _index: number;

  private _setCursor: (cursor: ICursor) => void;

  constructor(
    private editor: EditorManger,
    setCursor: (cursor: ICursor) => void
  ) {
    this._index = 0;

    this._setCursor = setCursor;
  }

  public get index() {
    return this._index;
  }

  setCursor(
    cursor: Omit<
      ICursor,
      "isFocusCanvas" | "index" | "lineMaxFontSize" | "fontSize"
    >
  ) {
    this.editor.textStyle.reset();

    let lineMaxFontSize;

    if (this.editor.text.length() === 0) {
      lineMaxFontSize = this.editor.textStyle.defaultFontSize;
    } else {
      lineMaxFontSize =
        this.editor.text.getLineText(this._index)?.maxFontSize ??
        this.editor.textStyle.defaultFontSize;
    }

    const textStyle = this.editor.textStyle.getTextStyle(this._index);

    this._setCursor({
      ...cursor,
      fontSize: textStyle.fontSize,
      lineMaxFontSize,
      index: this._index,
      isFocusCanvas: true,
    });
  }

  setCursorIndex(cursorIndex: number, shouldUpdatePosition: boolean = true) {
    if (cursorIndex < 0 || this.editor.text.length() < cursorIndex) return;

    this._index = cursorIndex;

    //just update index function because run setCursor from getCanvasData function
    if (!shouldUpdatePosition) return;

    if (cursorIndex === 0) return this.resetCursorToPage();

    const ctx = createCanvasElement();
    if (!ctx) return;

    const lineTextArr = this.editor.text.getLineTextArray();

    let targetLine: ILineText | null = null;
    let pageIndex = 0;

    if (this._index > this.editor.text.length() - 1) {
      const lastPage = lineTextArr[lineTextArr.length - 1];
      targetLine = lastPage[lastPage.length - 1];
      pageIndex = lineTextArr.length - 1;
    } else {
      outerLoop: for (let p = 0; p < lineTextArr.length; p++) {
        for (let i = 0; i < lineTextArr[p].length; i++) {
          const lineText = lineTextArr[p][i];

          if (lineText.endIndex >= this._index) {
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
      targetLine.text.length - (targetLine.endIndex - this._index) - 1
    );

    targetLine.text.slice(0, textSliceIndex).forEach((textFragment) => {
      ctx.font = getFontStyle(textFragment);

      x += ctx.measureText(textFragment.text).width;
    });

    this.setCursor({
      x,
      y: targetLine.y,
      pageIndex,
    });
  }

  resetCursorToPage(pageIndex?: number) {
    this.setCursor({
      x: this.editor.layout.marginX,
      y: this.editor.layout.marginY,
      pageIndex: pageIndex ?? 0,
    });
  }
}
