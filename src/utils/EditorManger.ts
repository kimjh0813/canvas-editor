import { LineText, TextFragment } from "../types/editor";
import { EditorKeyHandler } from "./EditorKeyHandler";
import { Cursor } from "../recoil";
import { measureTextWidth } from "./ctx";

export class EditorManger extends EditorKeyHandler {
  private _canvasWidth: number;
  private _canvasHeight: number;
  private _pageSize: number;

  private _setPageSizeCallback: (pageSize: number) => void;

  constructor(
    defaultFontSize: number,
    marginX: number,
    marginY: number,
    setPageSizeCallback: (pageSize: number) => void,
    setCursor: (cursor: Cursor) => void
  ) {
    super(defaultFontSize, marginX, marginY, setCursor);

    this._canvasWidth = 794;
    this._canvasHeight = 1123;
    this._pageSize = 1;

    this._setPageSizeCallback = setPageSizeCallback;
  }
  public get canvasWidth(): number {
    return this._canvasWidth;
  }
  public get canvasHeight(): number {
    return this._canvasHeight;
  }
  public get pageSize(): number {
    return this._pageSize;
  }

  canvasClick(clickX: number, clickY: number, pageIndex: number) {
    const result = this.clearSelectedRange();
    this._prevRowIndex = null;

    const lineTextArr = this.lineTexts.get(pageIndex);
    if (!lineTextArr || lineTextArr.length === 0) {
      this._setCursor({
        x: this.marginX,
        y: this.marginY,
        fontSize: this.defaultFontSize,
        pageIndex,
      });
      return result;
    }

    const lastLine = lineTextArr[lineTextArr.length - 1];

    if (lastLine.y + lastLine.maxFontSize * 1.48 < clickY) {
      this.setCursorIndex(this.textArr.length);
      return result;
    }

    let closestLine: LineText | null = null;
    let isLastLine = false;

    for (let i = 0; i < lineTextArr.length; i++) {
      const line = lineTextArr[i];
      if (clickY >= line.y && clickY <= line.y + line.maxFontSize * 1.48) {
        closestLine = line;
        i === lineTextArr.length - 1 && (isLastLine = true);
        break;
      }
    }

    if (!closestLine) return result;

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

    if (!cursorIndex) {
      if (clickX > this.marginX) {
        // 마지막 줄일 경우 +1
        cursorIndex = isLastLine
          ? closestLine.endIndex + 1
          : closestLine.endIndex;
      } else {
        cursorIndex = closestLine.endIndex - closestLine.text.length + 1;
      }
    }

    this.setCursorIndex(cursorIndex);

    return result;
  }

  setPageSizeCallback(page: number) {
    this._pageSize = page;
    this._setPageSizeCallback(page);
  }

  getCanvasData(): Map<number, LineText[]> | undefined {
    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) return;

    const textFragments = this.textArr;
    this.cursorIndex;

    this.lineTexts = new Map();

    let lineText: TextFragment[] = [];
    let maxFontSize = this.defaultFontSize;

    let pageIndex = 0;
    let x = this.marginX;
    let y = this.marginY;

    for (let i = 0; i < textFragments.length; i++) {
      const _text = textFragments[i];
      const { text, fontSize } = _text;

      if (maxFontSize < fontSize) maxFontSize = fontSize;

      ctx.font = `500 ${fontSize}px Arial`;
      const textWidth = measureTextWidth(ctx, text);
      const currentWidth = x + this.marginX + textWidth;

      const isLastText = i === textFragments.length - 1;

      if (currentWidth > this.canvasWidth && text !== "\n") {
        const currentPageText = this.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i - 1,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        this.lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = this.marginX;
        lineText = [];
        maxFontSize = this.defaultFontSize;

        if (y + maxFontSize * 1.48 > this.canvasHeight - this.marginY) {
          pageIndex++;
          y = this.marginY;
        }
      }

      lineText.push(_text);
      x += textWidth;

      if (text === "\n") {
        const currentPageText = this.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        this.lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = this.marginX;
        lineText = [];
        maxFontSize = this.defaultFontSize;

        if (y + maxFontSize * 1.48 > this.canvasHeight - this.marginY) {
          pageIndex++;
          y = this.marginY;
        }
      }

      if (isLastText) {
        const currentPageText = this.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        this.lineTexts.set(pageIndex, currentPageText);
      }

      const cursor = { x, y, fontSize, pageIndex };

      if (this.cursorIndex === 0 && i === 0) {
        this._setCursor({
          x: this.marginX,
          y: this.marginY,
          fontSize: cursor.fontSize,
          pageIndex: cursor.pageIndex,
        });

        continue;
      }

      if (this.cursorIndex === i + 1) {
        this._setCursor(cursor);
      }
    }

    if (this.pageSize !== pageIndex + 1)
      this.setPageSizeCallback(pageIndex + 1);

    return this.lineTexts;
  }
}
