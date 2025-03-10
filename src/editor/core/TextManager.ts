import Hangul from "hangul-js";

import { ITextFragment } from "../types/text";

import { EditorManger } from "./EditorManger";
import { isKorean } from "../utils/key";

export class TextManager {
  private _textFragments: ITextFragment[];

  private _isKoreanComposing: boolean;

  constructor(private editor: EditorManger) {
    this._textFragments = [];
    this._isKoreanComposing = false;
  }

  public get textFragments() {
    return this._textFragments;
  }

  public get isKoreanComposing() {
    return this._isKoreanComposing;
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

      const newText = {
        text: key,
        ...fontStyle,
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

        for (let i = 1; i < assembleText.length; i++) {
          this.insert(cursorIndex, 0, {
            text: assembleText[i],
            ...fontStyle,
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

  deleteText() {
    const cursorIndex = this.editor.cursor.index;

    this.remove(cursorIndex - 1, 1);

    if (this._textFragments.length === 0) {
      this.editor.cursor.resetCursorPosition();
    }

    this.editor.cursor.setCursorIndex(cursorIndex - 1, false);
  }
}
