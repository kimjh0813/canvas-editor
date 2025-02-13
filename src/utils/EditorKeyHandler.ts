import Hangul from "hangul-js";

import { Cursor } from "../recoil";
import { LineText, SelectRange, TextFragment } from "../types/editor";
import { measureTextWidth } from "./ctx";
import { isCommandKey, isKorean } from "./key";

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

  private _marginX: number;
  private _marginY: number;

  private _isKoreanComposing: boolean;

  protected _prevRowIndex: number | null;
  protected _selectRange: SelectRange | null;
  protected lineTexts: Map<number, LineText[]>;
  protected _setCursor: (cursor: Cursor) => void;

  constructor(
    defaultFontSize: number,
    marginX: number,
    marginY: number,
    setCursor: (cursor: Cursor) => void
  ) {
    this.lineTexts = new Map();

    this._defaultFontSize = defaultFontSize;
    this._marginX = marginX;
    this._marginY = marginY;

    this._textArr = [];
    this._cursorIndex = 0;
    this._selectRange = null;
    this._prevRowIndex = null;
    this._isKoreanComposing = false;

    this._setCursor = setCursor;
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
  public get selectRange(): SelectRange | null {
    return this._selectRange;
  }
  public get marginX(): number {
    return this._marginX;
  }
  public get marginY(): number {
    return this._marginY;
  }
  public get isKoreanComposing(): boolean {
    return this._isKoreanComposing;
  }

  addRandomAlphabetText(count: number = 500) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < count; i++) {
      const randomChar = alphabet.charAt(
        Math.floor(Math.random() * alphabet.length)
      );

      const newText = {
        text: randomChar,
        fontSize: this._defaultFontSize,
      };

      this._textArr.splice(this._cursorIndex, 0, newText);

      this._cursorIndex++;
    }
  }

  addText(event: KeyboardEvent) {
    this.deleteSelectedRange();
    const key = event.key;

    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    if (!this._isKoreanComposing || this._cursorIndex === 0) {
      const newText = {
        text: key,
        fontSize: this._defaultFontSize,
      };

      this._textArr.splice(this._cursorIndex, 0, newText);
      this._cursorIndex++;
    } else {
      const prevText = this._textArr[this._cursorIndex - 1].text;
      const decomposed = Hangul.d(prevText);
      decomposed.push(key);
      const assembleText = Hangul.a(decomposed);

      if (assembleText.length === 1) {
        this._textArr[this._cursorIndex - 1].text = assembleText;
      } else {
        this._textArr[this._cursorIndex - 1].text = assembleText[0];

        for (let i = 1; i < assembleText.length; i++) {
          this._textArr.splice(this._cursorIndex, 0, {
            text: assembleText[i],
            fontSize: this._defaultFontSize,
          });
          this._cursorIndex++;
        }
      }
    }

    const isTextKorean = isKorean(key);

    if (this._isKoreanComposing !== isTextKorean) {
      this._isKoreanComposing = isTextKorean;
    }
  }

  deleteText() {
    const result = this.deleteSelectedRange();

    if (result) return;

    if (this._cursorIndex === 0) return;

    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    this._textArr.splice(this._cursorIndex - 1, 1);

    if (this._textArr.length === 0) {
      this._setCursor({
        x: this.marginX,
        y: this.marginY,
        fontSize: this.defaultFontSize,
        pageIndex: 0,
      });
    }

    this._cursorIndex--;
  }

  enter() {
    this.deleteSelectedRange();

    if (this._prevRowIndex !== null) this.setPrevRowIndex(null);

    this._textArr.splice(this._cursorIndex, 0, {
      text: "\n",
      fontSize: this._defaultFontSize,
    });

    this._cursorIndex++;
  }

  resetKoreanComposing() {
    if (!this._isKoreanComposing) return;

    this._isKoreanComposing = false;
  }

  allSelect() {
    if (this._textArr.length === 0) return;

    this._selectRange = {
      start: 0,
      end: this._textArr.length,
    };

    this.setCursorIndex(0);
  }

  clearSelectedRange() {
    if (this._selectRange === null) return;

    this._selectRange = null;
  }

  updateSelectedRange(start?: number, end?: number) {
    let startIndex;
    let endIndex;

    if (start !== undefined && start >= 0) {
      startIndex = start;
    } else if (this._selectRange) {
      startIndex = this._selectRange.start;
    } else {
      startIndex = this._cursorIndex;
    }

    if (end !== undefined && end <= this._textArr.length) {
      endIndex = end;
    } else if (this._selectRange) {
      endIndex = this._selectRange.end;
    } else {
      endIndex = this._cursorIndex;
    }

    this._selectRange = {
      start: startIndex,
      end: endIndex,
    };
  }

  deleteSelectedRange() {
    if (this._selectRange === null) return false;

    const { start, end } = this._selectRange;

    this._textArr.splice(start, end - start);

    this._selectRange = null;

    if (this._textArr.length === 0) {
      this._setCursor({
        fontSize: this._defaultFontSize,
        pageIndex: 0,
        x: this._marginX,
        y: this._marginY,
      });
    }

    this._cursorIndex = start;

    return true;
  }

  setPrevRowIndex(rowIndex: number | null) {
    if (rowIndex && rowIndex < 0) return;

    this._prevRowIndex = rowIndex;
  }

  setCursorIndex(index: number) {
    if (index < 0 || this._textArr.length < index) return;
    this._cursorIndex = index;

    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;

    const lineTextArr: LineText[][] = Array.from(this.lineTexts.values());

    let targetLine: LineText | null = null;
    let pageIndex = 0;

    if (this._cursorIndex > this._textArr.length - 1) {
      const lastPage = lineTextArr[lineTextArr.length - 1];
      targetLine = lastPage[lastPage.length - 1];
      pageIndex = lineTextArr.length - 1;
    } else {
      outerLoop: for (let p = 0; p < lineTextArr.length; p++) {
        for (let i = 0; i < lineTextArr[p].length; i++) {
          const lineText = lineTextArr[p][i];

          if (lineText.endIndex >= this._cursorIndex) {
            targetLine = lineText;
            pageIndex = p;
            break outerLoop;
          }
        }
      }
    }

    if (!targetLine) return;

    let x = targetLine.x;
    const textSliceIndex = Math.max(
      0,
      targetLine.text.length - (targetLine.endIndex - this._cursorIndex) - 1
    );

    targetLine.text.slice(0, textSliceIndex).forEach(({ fontSize, text }) => {
      ctx.font = `500 ${fontSize}px Arial`;
      x += measureTextWidth(ctx, text);
    });

    this._setCursor({
      x,
      y: targetLine.y,
      fontSize: targetLine.maxFontSize,
      pageIndex,
    });
  }

  arrowUp(event: KeyboardEvent) {
    if (this._cursorIndex === 0) {
      if (!event.shiftKey && this._selectRange) {
        this.clearSelectedRange();
      }
      return;
    }

    let targetIndex = 0;

    const lineTextArr: LineText[] = Array.from(this.lineTexts.values()).flat();

    if (isCommandKey(event)) {
      targetIndex = 0;
    } else {
      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        // endIndex가 cursorIndex보다 크거나 혹은 마지막 줄일때(가장 끝에 커서가 잡혀있을때는 글자가 있는공간이 아니라 글자를 작성할 공간 인덱스에 있음)
        if (
          lineText.endIndex >= this._cursorIndex ||
          i === lineTextArr.length - 1
        ) {
          if (i === 0) {
            targetIndex = 0;
          } else {
            const targetLineText = lineTextArr[i - 1];

            if (this._prevRowIndex === null)
              this.setPrevRowIndex(
                this._cursorIndex - (targetLineText.endIndex + 1)
              );

            const prevRowIndex = this._prevRowIndex ?? 0;

            const targetRowStartIndex =
              targetLineText.endIndex - targetLineText.text.length + 1;

            targetIndex = targetRowStartIndex + prevRowIndex;

            if (targetLineText.endIndex < targetIndex) {
              targetIndex = targetLineText.endIndex;
            }
          }
          break;
        }
      }
    }

    let startIndex = undefined;
    let endIndex = undefined;

    if (event.shiftKey) {
      if (this._selectRange && this._selectRange.start <= targetIndex) {
        endIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        this._selectRange &&
        this._selectRange.start > targetIndex
      ) {
        startIndex = targetIndex;
        endIndex = endIndex =
          this._selectRange.end > this._cursorIndex
            ? this._selectRange.end
            : this._selectRange.start;
      } else {
        startIndex = targetIndex;
      }

      this.updateSelectedRange(startIndex, endIndex);
    } else {
      this.clearSelectedRange();
    }

    this.setCursorIndex(targetIndex);
  }

  arrowDown(event: KeyboardEvent) {
    const textLength = this._textArr.length;

    if (this._cursorIndex >= textLength) {
      if (!event.shiftKey && this._selectRange) {
        this.clearSelectedRange();
      }
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      targetIndex = textLength;
    } else {
      const lineTextArr: LineText[] = Array.from(
        this.lineTexts.values()
      ).flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= this._cursorIndex) {
          if (i === lineTextArr.length - 1) {
            targetIndex = textLength;
          } else {
            const targetLineText = lineTextArr[i + 1];

            if (this._prevRowIndex === null)
              this.setPrevRowIndex(
                this._cursorIndex -
                  (lineText.endIndex - lineText.text.length + 1)
              );

            const prevRowIndex = this._prevRowIndex ?? 0;

            const targetRowStartIndex =
              targetLineText.endIndex - targetLineText.text.length + 1;

            targetIndex = targetRowStartIndex + prevRowIndex;

            if (targetLineText.endIndex < targetIndex) {
              if (i === lineTextArr.length - 2 && targetIndex >= textLength) {
                targetIndex = textLength;
              } else {
                targetIndex = targetLineText.endIndex;
              }
            }
          }

          break;
        }
      }
    }

    let startIndex = undefined;
    let endIndex = undefined;

    if (event.shiftKey) {
      if (this._selectRange && this._selectRange.end >= targetIndex) {
        startIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        this._selectRange &&
        this._selectRange.end < targetIndex
      ) {
        startIndex =
          this._selectRange.start < this._cursorIndex
            ? this._selectRange.start
            : this._selectRange.end;
        endIndex = targetIndex;
      } else {
        endIndex = targetIndex;
      }

      this.updateSelectedRange(startIndex, endIndex);
    } else {
      this.clearSelectedRange();
    }

    this.setCursorIndex(targetIndex);
  }

  arrowLeft = (event: KeyboardEvent) => {
    if (this._cursorIndex === 0) {
      if (!event.shiftKey && this._selectRange) {
        this.clearSelectedRange();
      }
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      const lineTextArr: LineText[] = Array.from(
        this.lineTexts.values()
      ).flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (
          lineText.endIndex >= this._cursorIndex ||
          i === lineTextArr.length - 1
        ) {
          if (i === 0) {
            targetIndex = 0;
          } else {
            targetIndex = lineText.endIndex - lineText.text.length + 1;
          }

          break;
        }
      }
    } else {
      targetIndex = this._cursorIndex - 1;
    }

    if (targetIndex === this._cursorIndex) return;

    let startIndex = undefined;
    let endIndex = undefined;

    if (event.shiftKey) {
      if (this._selectRange && this._selectRange.start <= targetIndex) {
        endIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        this._selectRange &&
        this._selectRange.start > targetIndex
      ) {
        startIndex = targetIndex;
        endIndex =
          this._selectRange.end > this._cursorIndex
            ? this._selectRange.end
            : this._selectRange.start;
      } else {
        startIndex = targetIndex;
      }

      this.updateSelectedRange(startIndex, endIndex);
    } else {
      this.clearSelectedRange();
    }
    this.setPrevRowIndex(null);
    this.setCursorIndex(targetIndex);
  };

  arrowRight = (event: KeyboardEvent) => {
    const textLength = this._textArr.length;

    if (this._cursorIndex >= textLength) {
      if (!event.shiftKey && this._selectRange) {
        this.clearSelectedRange();
      }
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      const lineTextArr: LineText[] = Array.from(
        this.lineTexts.values()
      ).flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= this._cursorIndex) {
          targetIndex =
            i === lineTextArr.length - 1
              ? lineText.endIndex + 1
              : lineText.endIndex;

          break;
        }
      }
    } else {
      targetIndex = this._cursorIndex + 1;
    }

    if (targetIndex === this._cursorIndex) return;

    let startIndex = undefined;
    let endIndex = undefined;

    if (event.shiftKey) {
      if (this._selectRange && this._selectRange.end >= targetIndex) {
        startIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        this._selectRange &&
        this._selectRange.end < targetIndex
      ) {
        startIndex =
          this._selectRange.start < this._cursorIndex
            ? this._selectRange.start
            : this._selectRange.end;
        endIndex = targetIndex;
      } else {
        endIndex = targetIndex;
      }

      this.updateSelectedRange(startIndex, endIndex);
    } else {
      this.clearSelectedRange();
    }
    this.setPrevRowIndex(null);
    this.setCursorIndex(targetIndex);
  };

  keyDown(event: KeyboardEvent) {
    // change textArr
    let result = false;

    if (!functionKey.includes(event.key)) event.preventDefault();

    if (event.key.length === 1) {
      if (isCommandKey(event)) {
        this.resetKoreanComposing();
        switch (event.code) {
          case "KeyA":
            this.allSelect();
            break;
          case "KeyR":
            location.reload();
            break;
          default:
            break;
        }
      } else {
        result = true;
        this.addText(event);
      }

      return result;
    } else {
      switch (event.key) {
        case "Backspace":
          this.deleteText();
          result = true;
          break;
        case "Enter":
          this.enter();
          this.resetKoreanComposing();
          result = true;
          break;
        case "ArrowDown":
          this.arrowDown(event);
          this.resetKoreanComposing();
          break;
        case "ArrowUp":
          this.arrowUp(event);
          this.resetKoreanComposing();
          break;
        case "ArrowLeft":
          this.arrowLeft(event);
          this.resetKoreanComposing();
          break;
        case "ArrowRight":
          this.arrowRight(event);
          this.resetKoreanComposing();
          break;
        default:
          console.log(`Unhandled special key: ${event.key}`);
          break;
      }

      return result;
    }
  }
}
