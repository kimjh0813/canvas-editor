import Hangul from "hangul-js";

import { ILineText, ITextFragment } from "../types/text";

import { EditorManger } from "./EditorManger";
import { isKorean } from "../utils/key";

export class TextManager {
  private _textFragments: ITextFragment[];
  private _lineTexts: Map<number, ILineText[]>;

  private _isKoreanComposing: boolean;

  constructor(private editor: EditorManger) {
    this._textFragments = [];
    this._isKoreanComposing = false;
    this._lineTexts = new Map();
  }

  public get textFragments() {
    return this._textFragments;
  }

  public get lineTexts() {
    return this._lineTexts;
  }

  public get isKoreanComposing() {
    return this._isKoreanComposing;
  }

  getLineTextArray() {
    return Array.from(this._lineTexts.values());
  }

  getLineText(index: number) {
    const lineTextArr = this.getLineTextArray().flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineText = lineTextArr[i];

      if (lineText.endIndex >= index || i === lineTextArr.length - 1) {
        return lineText;
      }
    }
  }

  getCurrentLineTargetIndex(isCommandKey: boolean, type: "left" | "right") {
    const isLeft = type === "left";
    const cursorIndex = this.editor.cursor.index;

    if (!isCommandKey) {
      return isLeft ? cursorIndex - 1 : cursorIndex + 1;
    }

    let targetIndex = 0;

    const lineTextArr = this.editor.text.getLineTextArray().flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineText = lineTextArr[i];

      const isCursorInLine = isLeft
        ? lineText.endIndex >= cursorIndex || i === lineTextArr.length - 1
        : lineText.endIndex >= cursorIndex;

      if (isCursorInLine) {
        const isLastLine = isLeft ? i === 0 : i === lineTextArr.length - 1;

        if (isLastLine) {
          targetIndex = isLeft ? 0 : lineText.endIndex + 1;
        } else {
          targetIndex = isLeft
            ? lineText.endIndex - lineText.text.length + 1
            : lineText.endIndex;
        }

        break;
      }
    }

    return targetIndex;
  }

  getRelativeLineTargetIndex(isCommandKey: boolean, type: "up" | "down") {
    const isUp = type === "up";
    const textLength = this.editor.text.length();

    if (isCommandKey) {
      return isUp ? 0 : textLength;
    }

    const cursorIndex = this.editor.cursor.index;
    const lineTextArr = this.getLineTextArray().flat();

    let targetIndex: number = 0;
    let targetLineText: ILineText | undefined;

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineText = lineTextArr[i];

      const isCursorInLine = isUp
        ? lineText.endIndex >= cursorIndex || i === lineTextArr.length - 1
        : lineText.endIndex >= cursorIndex;

      if (isCursorInLine) {
        const isLastLine = isUp ? i === 0 : i === lineTextArr.length - 1;

        if (isLastLine) {
          targetIndex = isUp ? 0 : textLength;
        } else {
          targetLineText = isUp ? lineTextArr[i - 1] : lineTextArr[i + 1];

          if (this.editor.prevRowIndex === null) {
            const prevRow = isUp
              ? cursorIndex - (targetLineText.endIndex + 1)
              : cursorIndex - (lineText.endIndex - lineText.text.length + 1);

            this.editor.setPrevRowIndex(prevRow);
          }

          const prevRowIndex = this.editor.prevRowIndex ?? 0;

          const targetRowStartIndex =
            targetLineText.endIndex - targetLineText.text.length + 1;

          targetIndex = targetRowStartIndex + prevRowIndex;

          if (isUp) {
            if (targetLineText.endIndex < targetIndex) {
              targetIndex = targetLineText.endIndex;
            }
          } else {
            if (targetLineText.endIndex < targetIndex) {
              if (i === lineTextArr.length - 2 && targetIndex >= textLength) {
                targetIndex = textLength;
              } else {
                targetIndex = targetLineText.endIndex;
              }
            }
          }
        }

        break;
      }
    }

    return targetIndex;
  }

  resetLineTexts() {
    this._lineTexts = new Map();
  }

  length() {
    return this._textFragments.length;
  }

  remove(start: number, deleteCount: number) {
    this._textFragments.splice(start, deleteCount);
  }

  insert(start: number, deleteCount: number, ...items: ITextFragment[]) {
    this._textFragments.splice(start, deleteCount, ...items);
  }

  getTextFragment(index: number) {
    if (index < 0) return;

    return this._textFragments[index];
  }

  setTextFragment(index: number, value: ITextFragment) {
    if (index < 0) return;

    this._textFragments[index] = value;
  }

  setTextFragmentStyle(
    index: number,
    newStyle: Partial<Omit<ITextFragment, "text">>
  ) {
    if (!this._textFragments[index]) return;

    this._textFragments[index] = {
      ...this._textFragments[index],
      ...newStyle,
    };
  }

  resetKoreanComposing() {
    if (!this._isKoreanComposing) return;

    this._isKoreanComposing = false;
  }

  addText(event: KeyboardEvent) {
    this.editor.select.deleteSelectedRange();

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.index;
    const key = event.key;

    if (!this._isKoreanComposing || cursorIndex === 0) {
      const fontStyle = this.editor.textStyle.getTextStyle(cursorIndex);
      const lineStyle = this.editor.lineStyle.getLineStyle(cursorIndex);

      const newText = {
        text: key,
        ...fontStyle,
        ...lineStyle,
      };

      this.insert(cursorIndex, 0, newText);

      this.editor.cursor.setCursorIndex(cursorIndex + 1, false);
    } else {
      const text = this._textFragments[cursorIndex - 1].text;
      const decomposed = Hangul.d(text);
      decomposed.push(key);
      const assembleText = Hangul.a(decomposed);

      if (assembleText.length === 1) {
        this._textFragments[cursorIndex - 1].text = assembleText;
      } else {
        this._textFragments[cursorIndex - 1].text = assembleText[0];

        const fontStyle = this.editor.textStyle.getTextStyle(cursorIndex);
        const lineStyle = this.editor.lineStyle.getLineStyle(cursorIndex);

        for (let i = 1; i < assembleText.length; i++) {
          this.insert(cursorIndex, 0, {
            text: assembleText[i],
            ...fontStyle,
            ...lineStyle,
          });

          this.editor.cursor.setCursorIndex(cursorIndex + 1, false);
        }
      }
    }

    const isTextKorean = isKorean(key);

    if (this._isKoreanComposing !== isTextKorean) {
      this._isKoreanComposing = isTextKorean;
    }
  }

  addTexts(textFragments: ITextFragment[]) {
    this.editor.select.deleteSelectedRange();

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.index;
    this.insert(cursorIndex, 0, ...textFragments);

    this.editor.cursor.setCursorIndex(
      cursorIndex + textFragments.length,
      false
    );
  }

  deleteText() {
    const cursorIndex = this.editor.cursor.index;

    this.remove(cursorIndex - 1, 1);

    if (this._textFragments.length === 0) {
      this.editor.cursor.resetCursorToPage();
    }

    this.editor.cursor.setCursorIndex(cursorIndex - 1, false);
  }
}
