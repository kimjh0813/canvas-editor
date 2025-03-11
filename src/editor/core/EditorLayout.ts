export class EditorLayout {
  private _canvasWidth: number;
  private _canvasHeight: number;

  private _marginX: number;
  private _marginY: number;

  private _pageSize: number;
  private _setPageSize: (pageSize: number) => void;

  constructor(
    marginX: number,
    marginY: number,
    setPageSize: (pageSize: number) => void
  ) {
    this._canvasWidth = 794;
    this._canvasHeight = 1123;

    this._marginX = marginX;
    this._marginY = marginY;

    this._pageSize = 1;
    this._setPageSize = setPageSize;
  }

  public get canvasWidth() {
    return this._canvasWidth;
  }

  public get canvasHeight() {
    return this._canvasHeight;
  }

  public get marginX() {
    return this._marginX;
  }

  public get marginY() {
    return this._marginY;
  }

  public get pageSize() {
    return this._pageSize;
  }

  setPageSize(page: number) {
    this._pageSize = page;
    this._setPageSize(page);
  }
}
