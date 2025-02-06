import { LineText, TextFragment } from "../types/editor";
import { EditorKeyHandler } from "./EditorKeyHandler";
import { Cursor } from "../recoil";

export class EditorManger extends EditorKeyHandler {
  private _marginX: number;
  private _marginY: number;
  private _canvasWidth: number;
  private _canvasHeight: number;
  private _pageSize: number;

  private _setPageSizeCallback: (pageSize: number) => void;

  constructor(
    defaultFontSize: number,
    setPageSizeCallback: (pageSize: number) => void,
    setCursor: (cursor: Cursor) => void
  ) {
    super(defaultFontSize, setCursor);

    this._marginX = 40;
    this._marginY = 40;
    this._canvasWidth = 794;
    this._canvasHeight = 1123;
    this._pageSize = 1;

    this._setPageSizeCallback = setPageSizeCallback;
  }

  public get marginX(): number {
    return this._marginX;
  }
  public get marginY(): number {
    return this._marginY;
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
    const lineTextArr = this.lineTexts.get(pageIndex);
    if (!lineTextArr || lineTextArr.length === 0) return;

    const lastLine = lineTextArr[lineTextArr.length - 1];

    if (lastLine.y + lastLine.maxFontSize * 1.48 < clickY) {
      this.setCursorIndex(this.textArr.length);
      return;
    }

    let closestLine: LineText | null = null;

    for (const line of lineTextArr) {
      if (clickY >= line.y && clickY <= line.y + line.maxFontSize * 1.48) {
        closestLine = line;
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

      const textWidth = ctx.measureText(text).width;
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
      if (clickX > this._marginX) {
        // 마지막 줄일 경우 +1
        cursorIndex =
          this.textArr.length - 1 === closestLine.endIndex
            ? closestLine.endIndex + 1
            : closestLine.endIndex;
      } else {
        cursorIndex = closestLine.endIndex - closestLine.text.length + 1;
      }
    }

    this.setCursorIndex(cursorIndex);
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
      const textWidth = ctx.measureText(text).width;
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
          y: this._marginY,
          fontSize: cursor.fontSize,
          pageIndex: cursor.pageIndex,
        });
        return;
      }

      if (this.cursorIndex === i + 1) {
        this._setCursor(cursor);
      }
    }

    if (this.pageSize !== this.lineTexts.size && this.lineTexts.size > 0)
      this.setPageSizeCallback(this.lineTexts.size);

    return this.lineTexts;
  }
}
