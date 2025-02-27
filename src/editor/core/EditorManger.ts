import { ICursor } from "../../recoil";
import { ILineText, ITextFragment } from "../types/text";
import { measureTextWidth } from "../utils/ctx";
import { CanvasMouseManager } from "./CanvasMouseManager";
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
  canvasMouse: CanvasMouseManager;

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
    this.canvasMouse = new CanvasMouseManager(this);
  }

  public get prevRowIndex() {
    return this._prevRowIndex;
  }

  public get lineTexts() {
    return this._lineTexts;
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

    let pageIndex = 0;
    let x = marginX;
    let y = marginY;

    let cursor;

    for (let i = 0; i < textFragments.length; i++) {
      const _text = textFragments[i];
      const { text, fontSize } = _text;

      ctx.font = `500 ${fontSize}px Arial`;
      const textWidth = measureTextWidth(ctx, text);
      const currentWidth = x + marginX + textWidth;

      const isLastText = i === textFragments.length - 1;

      if (currentWidth > canvasWidth && text !== "\n") {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

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

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      lineText.push(_text);
      x += textWidth;

      if (text === "\n") {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

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

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      if (isLastText) {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

        const currentPageText = this._lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize: maxFontSize,
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
