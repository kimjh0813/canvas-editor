import { LineText, TextFragment } from "../types/editor";

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

export class EditorKeyHandler {
  private _textArr: TextFragment[];
  private _cursorIndex: number;
  private _defaultFontSize: number;
  private _prevRowIndex: number | null;

  protected lineTexts: Map<number, LineText[]>;

  constructor(defaultFontSize: number) {
    this._defaultFontSize = defaultFontSize;
    this._textArr = [];
    this._cursorIndex = 0;
    this._prevRowIndex = null;
    this.lineTexts = new Map();
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

  arrowUp() {
    if (this._cursorIndex === 0) return;

    const lineTextArr: LineText[] = Array.from(this.lineTexts.values()).flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineTexts = lineTextArr[i];

      // endIndex가 cursorIndex보다 크거나 혹은 마지막 줄일때(가장 끝에 커서가 잡혀있을때는 글자가 있는공간이 아니라 글자를 작성할 공간 인덱스에 있음)
      if (
        lineTexts.endIndex >= this._cursorIndex ||
        i === lineTextArr.length - 1
      ) {
        if (i === 0) {
          this.setCursorIndex(0);
        } else {
          const prevLineText = lineTextArr[i - 1];

          if (this._prevRowIndex === null)
            this.setPrevRowIndex(
              this._cursorIndex - (prevLineText.endIndex + 1)
            );
          const prevRowIndex = this._prevRowIndex ?? 0;
          const prevRowStartIndex =
            prevLineText.endIndex - prevLineText.text.length + 1;

          const targetCursorIndex = prevRowStartIndex + prevRowIndex;

          this.setCursorIndex(
            targetCursorIndex < prevLineText.endIndex
              ? targetCursorIndex
              : prevLineText.endIndex
          );
        }
        break;
      }
    }
  }

  arrowDown() {
    const textLength = this._textArr.length;
    if (this._cursorIndex > textLength) return;

    const lineTextArr: LineText[] = Array.from(this.lineTexts.values()).flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineTexts = lineTextArr[i];

      if (lineTexts.endIndex >= this._cursorIndex) {
        if (i === lineTextArr.length - 1) {
          this.setCursorIndex(textLength);
        } else {
          const nextLineText = lineTextArr[i + 1];

          if (this._prevRowIndex === null)
            this.setPrevRowIndex(
              this._cursorIndex -
                (lineTexts.endIndex - lineTexts.text.length + 1)
            );

          const prevRowIndex = this._prevRowIndex ?? 0;
          const nextRowStartIndex =
            nextLineText.endIndex - nextLineText.text.length + 1;

          let targetCursorIndex = nextRowStartIndex + prevRowIndex;

          if (nextLineText.endIndex < targetCursorIndex) {
            if (
              i === lineTextArr.length - 2 &&
              targetCursorIndex > textLength
            ) {
              targetCursorIndex = textLength;
            } else {
              targetCursorIndex = nextLineText.endIndex;
            }
          }

          this.setCursorIndex(targetCursorIndex);
        }
        break;
      }
    }
  }

  arrowLeft = (event: KeyboardEvent) => {
    if (event.metaKey) {
      const lineTextArr: LineText[] = Array.from(
        this.lineTexts.values()
      ).flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineTexts = lineTextArr[i];

        if (
          lineTexts.endIndex >= this._cursorIndex ||
          i === lineTextArr.length - 1
        ) {
          if (i === 0) {
            this.setPrevRowIndex(null);
            this.setCursorIndex(0);
          } else {
            this.setPrevRowIndex(null);
            this.setCursorIndex(lineTexts.endIndex - lineTexts.text.length + 1);
          }

          break;
        }
      }
    } else {
      this.setPrevRowIndex(null);
      this.setCursorIndex(this._cursorIndex - 1);
    }
  };

  arrowRight = (event: KeyboardEvent) => {
    if (event.metaKey) {
      const lineTextArr: LineText[] = Array.from(
        this.lineTexts.values()
      ).flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineTexts = lineTextArr[i];

        if (lineTexts.endIndex >= this._cursorIndex) {
          const targetIndex =
            i === lineTextArr.length - 1
              ? lineTexts.endIndex + 1
              : lineTexts.endIndex;

          this.setPrevRowIndex(null);
          this.setCursorIndex(targetIndex);

          break;
        }
      }
    } else {
      this.setPrevRowIndex(null);
      this.setCursorIndex(this._cursorIndex + 1);
    }
  };

  keyDown(event: KeyboardEvent) {
    if (!functionKey.includes(event.key)) event.preventDefault();

    if (event.key.length === 1) {
      if (event.metaKey) {
        switch (event.code) {
          case "KeyR":
            location.reload();
            break;
          default:
            break;
        }
      } else {
        this.addText(event.key);

        return true;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          this.deleteText();
          break;
        case "Enter":
          this.enter();
          break;
        case "ArrowDown":
          this.arrowDown();
          break;
        case "ArrowUp":
          this.arrowUp();
          break;
        case "ArrowLeft":
          this.arrowLeft(event);
          break;
        case "ArrowRight":
          this.arrowRight(event);
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
