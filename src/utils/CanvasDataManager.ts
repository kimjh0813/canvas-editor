import { LineText, TextFragment } from "../types/editor";
import { EditorDataManager } from "./EditorDataManager";
import { Cursor } from "../recoil";

export class CanvasDataManager {
  private editorDataManager: EditorDataManager;

  private _marginX: number;
  private _marginY: number;
  private _canvasWidth: number;
  private _canvasHeight: number;
  private _pageSize: number;

  private _lineTexts: Map<number, LineText[]>;
  private _setPageSizeCallback: (pageSize: number) => void;
  private _setCursor: (cursor: Cursor) => void;

  constructor(
    editorDataManager: EditorDataManager,
    setPageSizeCallback: (pageSize: number) => void,
    setCursor: (cursor: Cursor) => void
  ) {
    this.editorDataManager = editorDataManager;

    this._marginX = 40;
    this._marginY = 40;
    this._canvasWidth = 794;
    this._canvasHeight = 1123;
    this._pageSize = 1;

    this._lineTexts = new Map();
    this._setPageSizeCallback = setPageSizeCallback;
    this._setCursor = setCursor;
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
  public get lineTexts(): Map<number, LineText[]> {
    return this._lineTexts;
  }
  public get pageSize(): number {
    return this._pageSize;
  }

  setPageSizeCallback(page: number) {
    this._pageSize = page;
    this._setPageSizeCallback(page);
  }

  setCursor(cursor: Cursor) {
    this._setCursor(cursor);
  }

  setLineTexts(
    endIndex: number,
    lineTexts: Map<number, LineText[]>,
    lineText: TextFragment[],
    pageIndex: number,
    maxFontSize: number,
    x: number,
    y: number
  ) {
    const currentPageText = lineTexts.get(pageIndex) || [];
    currentPageText.push({
      endIndex,
      maxFontSize,
      text: lineText,
      x: this.marginX,
      y,
    });

    lineTexts.set(pageIndex, currentPageText);

    y += maxFontSize * 1.48;
    x = this.marginX;
    lineText = [];
    maxFontSize = this.editorDataManager.defaultFontSize;

    if (y + maxFontSize * 1.48 > this.canvasHeight - this.marginY) {
      pageIndex++;
      y = this.marginY;
    }
  }

  getCanvasData(): Map<number, LineText[]> | undefined {
    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) return;

    const textFragments = this.editorDataManager.textArr;

    const lineTexts: Map<number, LineText[]> = new Map();
    let lineText: TextFragment[] = [];
    let maxFontSize = this.editorDataManager.defaultFontSize;

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
        const currentPageText = lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i - 1,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = this.marginX;
        lineText = [];
        maxFontSize = this.editorDataManager.defaultFontSize;

        if (y + maxFontSize * 1.48 > this.canvasHeight - this.marginY) {
          pageIndex++;
          y = this.marginY;
        }
      }

      lineText.push(_text);
      x += textWidth;

      if (text === "\n") {
        const currentPageText = lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        lineTexts.set(pageIndex, currentPageText);

        y += maxFontSize * 1.48;
        x = this.marginX;
        lineText = [];
        maxFontSize = this.editorDataManager.defaultFontSize;

        if (y + maxFontSize * 1.48 > this.canvasHeight - this.marginY) {
          pageIndex++;
          y = this.marginY;
        }
      }

      if (isLastText) {
        const currentPageText = lineTexts.get(pageIndex) || [];
        currentPageText.push({
          endIndex: i - 1,
          maxFontSize,
          text: lineText,
          x: this.marginX,
          y,
        });

        lineTexts.set(pageIndex, currentPageText);

        this.setCursor({ x, y, fontSize, pageIndex });
      }
    }

    if (this.pageSize !== lineTexts.size && lineTexts.size > 0)
      this.setPageSizeCallback(lineTexts.size);

    return lineTexts;
  }
}
