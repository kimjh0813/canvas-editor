import { TextFragment } from "../types/editor";

const functionKey = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

export class EditorDataManager {
  private _textArr: TextFragment[];
  private _cursorIndex: number;
  private _defaultFontSize: number;
  private _prevRowIndex: number | null;

  constructor(defaultFontSize: number) {
    this._defaultFontSize = defaultFontSize;
    this._textArr = [];
    this._cursorIndex = 0;
    this._prevRowIndex = null;
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
  public get prevRowIndex(): number | null {
    return this._prevRowIndex;
  }

  setPrevRowIndex(rowIndex: number | null) {
    if (rowIndex && rowIndex < 0) return;

    this._prevRowIndex = rowIndex;
  }

  setCursorIndex(index: number) {
    if (index < 0 || this._textArr.length < index) return;

    this._cursorIndex = index;
  }

  addText(text: string) {
    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

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

    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    this._textArr.splice(this._cursorIndex - 1, 1);

    if (this._textArr.length === 0) {
      this.notifyTextCleared();
    }

    this._cursorIndex--;
  }

  enter() {
    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    this._textArr.splice(this._cursorIndex, 0, {
      text: "\n",
      fontSize: this._defaultFontSize,
      isSelect: false,
    });

    this._cursorIndex++;
  }

  keyDown(event: KeyboardEvent) {
    if (!functionKey.includes(event.key)) event.preventDefault();

    if (event.metaKey) {
      switch (event.code) {
        case "KeyR":
          location.reload();
          break;
        default:
          break;
      }
    } else if (event.key.length === 1) {
      this.addText(event.key);

      return true;
    } else {
      switch (event.key) {
        case "Backspace":
          this.deleteText();
          break;
        case "Enter":
          this.enter();
          break;
        case "ArrowDown":
          this.arrowEvent("ArrowDown");
          break;
        case "ArrowUp":
          this.arrowEvent("ArrowUp");
          break;
        case "ArrowLeft":
          this.arrowEvent("ArrowLeft");
          break;
        case "ArrowRight":
          this.arrowEvent("ArrowRight");
          break;
        default:
          console.log(`Unhandled special key: ${event.key}`);
          break;
      }

      return true;
    }
  }

  arrowEvent(type: "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight") {
    window.dispatchEvent(new Event(type, {}));
  }

  notifyTextCleared() {
    window.dispatchEvent(new Event("notifyTextCleared", {}));
  }
}
