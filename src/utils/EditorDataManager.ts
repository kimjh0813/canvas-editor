import { TextFragment } from "../types/editor";

export class EditorDataManager {
  private _textArr: TextFragment[];
  private _cursorIndex: number;
  private _defaultFontSize: number;

  constructor(defaultFontSize: number) {
    this._defaultFontSize = defaultFontSize;
    this._textArr = [];
    this._cursorIndex = 0;
  }

  public get textArr(): TextFragment[] {
    return this._textArr;
  }
  public get cursorIndex(): number {
    return this._cursorIndex;
  }
  public get defaultFontSize(): number {
    return this._defaultFontSize;
  }

  addText(text: string) {
    const newText = {
      text,
      fontSize: this._defaultFontSize,
      isSelect: false,
    };

    this._textArr.splice(this._cursorIndex, 0, newText);

    this._cursorIndex++;
  }

  deleteText() {
    if (this._cursorIndex === 0) return;

    this._textArr.splice(this._cursorIndex - 1, this._cursorIndex);

    if (this._textArr.length === 0) {
      this.notifyTextCleared();
    }

    this._cursorIndex--;
  }

  enter() {
    this._textArr.push({
      text: "\n",
      fontSize: this._defaultFontSize,
      isSelect: false,
    });

    this._cursorIndex++;
  }

  setBarPosition() {}

  keyDown(event: KeyboardEvent) {
    if (event.key.length === 1) {
      if (event.code === "Space") {
        event.preventDefault();
      }

      this.addText(event.key);
    } else {
      switch (event.key) {
        case "Backspace":
          this.deleteText();
          break;
        case "Enter":
          this.enter();
          break;
        case "ArrowDown":
          break;
        case "ArrowUp":
          break;
        case "ArrowLeft":
          break;
        case "ArrowRight":
          break;
        default:
          console.log(`Unhandled special key: ${event.key}`);
          break;
      }
    }
  }

  notifyTextCleared() {
    window.dispatchEvent(new Event("notifyTextCleared", {}));
  }
}
