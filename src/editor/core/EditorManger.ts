import { ICursor } from "../../recoil";
import { ILineText, ITextFragment } from "../types/text";
import { measureTextWidth } from "../utils/ctx";
import { getFontStyle } from "../utils/text";
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

  constructor(
    defaultFontSize: number,
    marginX: number,
    marginY: number,
    scrollContainerRef: React.RefObject<HTMLDivElement>,
    public draw: (shouldUpdateText: boolean) => void,
    setCursor: (cursor: ICursor) => void,
    setPageSize: (pageSize: number) => void
  ) {
    this._prevRowIndex = null;

    this.text = new TextManager(this);
    this.cursor = new Cursor(this, setCursor);
    this.select = new SelectRange(this);
    this.layout = new EditorLayout(marginX, marginY, setPageSize);
    this.keyEvent = new KeyEvent(this);
    this.textStyle = new TextStyle(this, defaultFontSize);
    this.canvasMouse = new CanvasMouseManager(this, scrollContainerRef);
  }

  public get prevRowIndex() {
    return this._prevRowIndex;
  }

  setPrevRowIndex(rowIndex: number | null) {
    if (rowIndex && rowIndex < 0) return;

    this._prevRowIndex = rowIndex;
  }

  getCanvasData(
    shouldUpdateText: boolean
  ): Map<number, ILineText[]> | undefined {
    if (!shouldUpdateText) return this.text.lineTexts;

    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) return;

    this.text.resetLineTexts();

    const cursorIndex = this.cursor.index;
    const textFragments = this.text.textFragments;
    const { canvasHeight, canvasWidth, marginX, marginY } = this.layout;

    let lineText: ITextFragment[] = [];

    let pageIndex = 0;
    let x = marginX;
    let y = marginY;

    let cursor;

    if (textFragments.length === 0 || cursorIndex === 0)
      this.cursor.resetCursorToPage();

    for (let i = 0; i < textFragments.length; i++) {
      const textFragment = textFragments[i];

      const { text, fontSize } = textFragment;

      ctx.font = getFontStyle(textFragment);

      const textWidth = measureTextWidth(ctx, text);
      const currentWidth = x + marginX + textWidth;

      const isLastText = i === textFragments.length - 1;

      if (currentWidth > canvasWidth && text !== "\n") {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

        const currentPageText = this.text.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i - 1,
          maxFontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this.text.lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = marginX;
        lineText = [];

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      lineText.push(textFragment);
      x += textWidth;

      if (text === "\n") {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

        const currentPageText = this.text.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this.text.lineTexts.set(pageIndex, currentPageText);

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

        const currentPageText = this.text.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize: maxFontSize,
          text: lineText,
          x: marginX,
          y,
        });

        this.text.lineTexts.set(pageIndex, currentPageText);
      }

      if (cursorIndex === i + 1) cursor = { x, y, pageIndex };
    }

    if (cursor) this.cursor.setCursor(cursor);

    if (this.layout.pageSize !== pageIndex + 1)
      this.layout.setPageSize(pageIndex + 1);

    return this.text.lineTexts;
  }
}
