import { ICursor } from "../../recoil";
import { ILineText, ITextFragment } from "../types/text";
import { createCanvasElement } from "../utils/ctx";
import { convertHTMLToText, getFontStyle } from "../utils/text";
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

  getLineTextsFormTextFragments(
    shouldUpdateText: boolean
  ): Map<number, ILineText[]> | undefined {
    if (!shouldUpdateText) return this.text.lineTexts;

    const ctx = createCanvasElement();
    const measureCtx = createCanvasElement();

    if (!ctx || !measureCtx) return;

    this.text.resetLineTexts();

    const textFragments = this.text.textFragments;
    const { canvasHeight, canvasWidth, marginX, marginY } = this.layout;

    let lineText: ITextFragment[] = [];

    let pageIndex = 0;
    let x = marginX;
    let y = marginY;

    for (let i = 0; i < textFragments.length; i++) {
      const textFragment = textFragments[i];

      const { text, fontSize } = textFragment;

      ctx.font = getFontStyle(textFragment);

      const textWidth = ctx.measureText(text).width;

      const currentWidth = x + marginX + textWidth;

      const isLastText = i === textFragments.length - 1;

      let isSpaceLineWrap = false;

      if (currentWidth > canvasWidth && text !== "\n") {
        let maxFontSize = lineText.reduce((acc, cur) => {
          return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
        }, 0);

        if (maxFontSize === 0) maxFontSize = fontSize;

        const lastSpaceIndex = lineText
          .map((t) => t.text)
          .join("")
          .lastIndexOf(" ");

        const hasSpace = lastSpaceIndex !== -1;
        isSpaceLineWrap = hasSpace;
        const _text = hasSpace
          ? lineText.slice(0, lastSpaceIndex + 1)
          : lineText;

        const currentPageText = this.text.lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: hasSpace
            ? i - (lineText.length - lastSpaceIndex) + 1 - 1
            : i - 1,
          maxFontSize,
          text: _text,
          x: marginX,
          y,
        });

        this.text.lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = marginX;
        lineText = hasSpace ? lineText.slice(lastSpaceIndex + 1) : [];

        if (y + fontSize * 1.48 > canvasHeight - marginY) {
          pageIndex++;
          y = marginY;
        }
      }

      if (lineText.length > 0 && isSpaceLineWrap) {
        x += lineText.reduce((acc, cur) => {
          measureCtx.font = getFontStyle(cur);

          return acc + measureCtx.measureText(cur.text).width;
        }, 0);
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
    }

    this.cursor.setCursorIndex(this.cursor.index);

    if (this.layout.pageSize !== pageIndex + 1)
      this.layout.setPageSize(pageIndex + 1);

    return this.text.lineTexts;
  }
}
