import { EditorManger } from "./EditorManger";

export class EditorLayout {
  private _canvasWidth: number;
  private _canvasHeight: number;

  private _defaultFontSize: number;

  private _marginX: number;
  private _marginY: number;

  constructor(defaultFontSize: number, marginX: number, marginY: number) {
    this._canvasWidth = 794;
    this._canvasHeight = 1123;

    this._defaultFontSize = defaultFontSize;

    this._marginX = marginX;
    this._marginY = marginY;
  }

  public get canvasWidth() {
    return this._canvasWidth;
  }

  public get canvasHeight() {
    return this._canvasHeight;
  }

  public get defaultFontSize() {
    return this._defaultFontSize;
  }

  public get marginX() {
    return this._marginX;
  }

  public get marginY() {
    return this._marginY;
  }
}
