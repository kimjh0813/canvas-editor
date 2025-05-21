import { SetterOrUpdater } from "recoil";
import { ICursor } from "../../recoil";
import { ILineText, ITextFragment, TLineAlign } from "../types/text";
import { createCanvasElement } from "../utils/ctx";
import { getFontStyle } from "../utils/text";
import { CanvasMouseManager } from "./CanvasMouseManager";
import { Cursor } from "./Cursor";
import { EditorLayout } from "./EditorLayout";
import { KeyEvent } from "./KeyEvent";
import { LineStyle } from "./LineStyle";
import { SelectRange } from "./SelectRange";
import { TextManager } from "./TextManager";
import { TextStyle } from "./TextStyle";
import { History } from "./History";

export class EditorManger {
  text: TextManager;
  cursor: Cursor;
  select: SelectRange;
  layout: EditorLayout;
  keyEvent: KeyEvent;
  textStyle: TextStyle;
  canvasMouse: CanvasMouseManager;
  lineStyle: LineStyle;
  history: History;

  private _prevRowIndex: number | null; //TODO:인덱스 말고 넓이 기준으로 바

  constructor(
    defaultFontSize: number,
    marginX: number,
    marginY: number,
    scrollContainerRef: React.RefObject<HTMLDivElement>,
    public draw: (shouldUpdateText: boolean) => void,
    setCursor: SetterOrUpdater<ICursor | undefined>,
    setPageSize: (pageSize: number) => void
  ) {
    this._prevRowIndex = null;

    this.text = new TextManager(this, defaultFontSize);
    this.cursor = new Cursor(this, setCursor);
    this.select = new SelectRange(this);
    this.layout = new EditorLayout(marginX, marginY, setPageSize);
    this.keyEvent = new KeyEvent(this);
    this.textStyle = new TextStyle(this, defaultFontSize);
    this.lineStyle = new LineStyle(this);
    this.canvasMouse = new CanvasMouseManager(this, scrollContainerRef);
    this.history = new History(this);
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

    const textLength = this.text.length();
    const textFragments = this.text.textFragments;
    const { canvasHeight, canvasWidth, marginX, marginY } = this.layout;

    let lineText: ITextFragment[] = [];

    let pageIndex = 0;
    let x = marginX;
    let y = marginY;

    const pushLine = (
      _lineText: ITextFragment[],
      endIndex: number,
      fontSize: number,
      shouldReset?: boolean,
      isLastLine?: boolean
    ) => {
      let __lineText: ITextFragment[];

      if (isLastLine) {
        __lineText = _lineText.slice(0, -1);
      } else {
        __lineText = _lineText;
      }

      let maxFontSize = __lineText.reduce((acc, cur) => {
        return cur.text === "\n" ? acc : Math.max(acc, cur.fontSize);
      }, 0);

      if (maxFontSize === 0) maxFontSize = fontSize;

      let lineWidth = 0;
      let xPos = marginX;
      for (const fragment of _lineText) {
        measureCtx.font = getFontStyle(fragment);
        lineWidth += measureCtx.measureText(fragment.text).width;
      }

      let align: TLineAlign;
      if (_lineText[0]) {
        align = _lineText[0].align;
      } else {
        align = textFragments[textLength - 1].align;
      }

      if (align === "center") {
        xPos = (canvasWidth - lineWidth) / 2;
      } else if (align === "right") {
        xPos = canvasWidth - lineWidth - marginX;
      }

      const currentPageText = this.text.lineTexts.get(pageIndex) || [];
      currentPageText.push({
        endIndex,
        maxFontSize,
        text: _lineText,
        x: xPos,
        y,
      });

      this.text.lineTexts.set(pageIndex, currentPageText);

      if (!shouldReset) return;

      x = marginX;
      y += maxFontSize * 1.48;

      if (y + fontSize * 1.48 > canvasHeight - marginY) {
        y = marginY;
        pageIndex++;
      }
    };

    for (let i = 0; i < textLength; i++) {
      const textFragment = textFragments[i];

      const { text, fontSize } = textFragment;

      ctx.font = getFontStyle(textFragment);

      const textWidth = ctx.measureText(text).width;
      const currentWidth = x + marginX + textWidth;
      const isLastText = i === textLength - 1;

      let isSpaceLineWrap = false;

      if (currentWidth > canvasWidth && text !== "\n") {
        const lastSpaceIndex = lineText
          .map((t) => t.text)
          .join("")
          .lastIndexOf(" ");

        const hasSpace = lastSpaceIndex !== -1;
        const _lineText = hasSpace
          ? lineText.slice(0, lastSpaceIndex + 1)
          : lineText;
        const endIndex = hasSpace
          ? i - (lineText.length - lastSpaceIndex) + 1 - 1
          : i - 1;

        pushLine(_lineText, endIndex, fontSize, true);

        isSpaceLineWrap = hasSpace;
        lineText = hasSpace ? lineText.slice(lastSpaceIndex + 1) : [];
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
        pushLine(lineText, i, fontSize, true);

        lineText = [];
      }

      if (isLastText) {
        pushLine(lineText, i, fontSize, false, true);
      }
    }

    this.cursor.setCursorIndex(this.cursor.index);

    if (this.layout.pageSize !== pageIndex + 1)
      this.layout.setPageSize(pageIndex + 1);

    return this.text.lineTexts;
  }
}
