import { ICursor } from "../../recoil";
import { ILineText, ITextFragment } from "../types/text";
import { measureTextWidth } from "../utils/ctx";
import { Cursor } from "./Cursor";
import { EditorLayout } from "./EditorLayout";
import { KeyEvent } from "./KeyEvent";
import { SelectRange } from "./SelectRange";
import { TextManager } from "./TextManager";
import { TextStyle } from "./TextStyle";

export class EditorManger {
  text: TextManager;
  cursor: Cursor;
  select: SelectRange;
  layout: EditorLayout;
  keyEvent: KeyEvent;
  textStyle: TextStyle;

  private _prevRowIndex: number | null; //TODO:인덱스 말고 넓이 기준으로 바

  private _lineTexts: Map<number, ILineText[]>;

  constructor(
    defaultFontSize: number,
    marginX: number,
    marginY: number,
    setCursor: (cursor: ICursor) => void,
    setPageSize: (pageSize: number) => void
  ) {
    this._lineTexts = new Map();
    this._prevRowIndex = null;

    this.text = new TextManager(this);
    this.cursor = new Cursor(this, setCursor);
    this.select = new SelectRange(this);
    this.layout = new EditorLayout(
      defaultFontSize,
      marginX,
      marginY,
      setPageSize
    );
    this.keyEvent = new KeyEvent(this);
    this.textStyle = new TextStyle(this);
  }

  public get prevRowIndex() {
    return this._prevRowIndex;
  }

  setPrevRowIndex(rowIndex: number | null) {
    if (rowIndex && rowIndex < 0) return;

    this._prevRowIndex = rowIndex;
  }

  getLineTextArray() {
    return Array.from(this._lineTexts.values());
  }

  getLineText(index: number) {
    const lineTextArr = this.getLineTextArray().flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineText = lineTextArr[i];

      if (lineText.endIndex >= index || i === lineTextArr.length - 1) {
        return lineText;
      }
    }
  }

  canvasClick(clickX: number, clickY: number, pageIndex: number) {
    this.select.clearSelectedRange();
    this.text.resetKoreanComposing();

    console.log(this._lineTexts);
    console.log(this.cursor.index);

    console.log(clickX, clickY);

    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    const lineTextArr = this._lineTexts.get(pageIndex);
    if (!lineTextArr || lineTextArr.length === 0) {
      this.cursor.resetCursorPosition(pageIndex);
      return;
    }

    const lastLine = lineTextArr[lineTextArr.length - 1];

    if (lastLine.y + lastLine.maxFontSize * 1.48 < clickY) {
      this.cursor.setCursorIndex(this.text.length());
      return;
    }

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

    console.log(closestLine);

    let x = closestLine.x;
    let cursorIndex: number | null = null;

    for (let i = 0; i < closestLine.text.length; i++) {
      const { text, fontSize } = closestLine.text[i];

      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `500 ${fontSize}px Arial`;

      const textWidth = measureTextWidth(ctx, text);
      const charMid = x + textWidth / 2;

      console.log(x, textWidth, charMid);
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
      if (clickX > this.layout.marginX) {
        // 마지막 줄일 경우 +1
        cursorIndex = isLastLine
          ? closestLine.endIndex + 1
          : closestLine.endIndex;
      } else {
        cursorIndex = closestLine.endIndex - closestLine.text.length + 1;
      }
    }

    this.cursor.setCursorIndex(cursorIndex);
  }

  getCanvasData(
    shouldUpdateText: boolean
  ): Map<number, ILineText[]> | undefined {
    if (!shouldUpdateText) return this._lineTexts;

    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) return;

    this._lineTexts = new Map();

    const textFragments = this.text.textFragments;
    const { canvasHeight, canvasWidth, marginX, marginY } = this.layout;

    let lineText: ITextFragment[] = [];
    let maxFontSize: number | null = null;

    let pageIndex = 0;
    let x = marginX;
    let y = marginY;

    let cursor;

    for (let i = 0; i < textFragments.length; i++) {
      const _text = textFragments[i];
      const { text, fontSize } = _text;

      if (maxFontSize === null || maxFontSize < fontSize)
        maxFontSize = fontSize;

      ctx.font = `500 ${fontSize}px Arial`;
      const textWidth = measureTextWidth(ctx, text);
      const currentWidth = x + marginX + textWidth;

      const isLastText = i === textFragments.length - 1;

      if (currentWidth > canvasWidth && text !== "\n") {
        const currentPageText = this._lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i - 1,
          maxFontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this._lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = marginX;
        lineText = [];
        maxFontSize = null;

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      lineText.push(_text);
      x += textWidth;

      if (text === "\n") {
        maxFontSize = maxFontSize ?? fontSize;

        const currentPageText = this._lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this._lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = marginX;
        lineText = [];
        maxFontSize = null;

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      if (isLastText) {
        const currentPageText = this._lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize: maxFontSize ?? fontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this._lineTexts.set(pageIndex, currentPageText);
      }

      if (this.cursor.index === i + 1) cursor = { x, y, fontSize, pageIndex };
    }

    if (cursor) this.cursor.setCursor(cursor);

    if (this.layout.pageSize !== pageIndex + 1)
      this.layout.setPageSize(pageIndex + 1);

    return this._lineTexts;
  }
}
