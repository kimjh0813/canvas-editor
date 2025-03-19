import { ITextStyle } from "../types/text";
import { EditorManger } from "./EditorManger";

import omit from "lodash/omit";

export class TextStyle {
  private _defaultStyle: ITextStyle;
  private _currentStyle: ITextStyle | undefined;

  constructor(private editor: EditorManger, defaultFontSize: number) {
    this._defaultStyle = {
      fontSize: defaultFontSize,
      fontFamily: "Arial",
      color: "#000000",
    };
    this._currentStyle = undefined;
  }

  public get defaultStyle() {
    return this._defaultStyle;
  }

  public get defaultFontSize() {
    return this._defaultStyle.fontSize;
  }

  setDefaultStyle(newStyle: Partial<ITextStyle>) {
    this._defaultStyle = { ...this._defaultStyle, ...newStyle };
  }

  setCurrentStyle(newStyle: Partial<ITextStyle>) {
    if (!this._currentStyle) {
      const _textStyle = this.getTextStyle(this.editor.cursor.index);
      const textStyle = _textStyle ? _textStyle : this._defaultStyle;

      this._currentStyle = { ...textStyle, ...newStyle };
    } else {
      this._currentStyle = { ...this._currentStyle, ...newStyle };
    }
  }

  getTextStyle(index: number) {
    let textStyle: ITextStyle;

    if (this._currentStyle) {
      textStyle = this._currentStyle;
    } else {
      const prevTextFragment = this.editor.text.getTextFragment(index - 1);
      const textFragment = this.editor.text.getTextFragment(index);

      if (
        prevTextFragment &&
        (prevTextFragment.text !== "\n" || !textFragment)
      ) {
        textStyle = omit(prevTextFragment, "text");
      } else if (textFragment) {
        textStyle = omit(textFragment, "text");
      } else {
        textStyle = this._defaultStyle;
      }
    }

    return textStyle;
  }

  checkTextStyle(startIndex: number, endIndex: number) {
    const textFragments = this.editor.text.textFragments.slice(
      startIndex,
      endIndex
    );

    if (textFragments.length === 0) return;

    const baseStyle: Partial<ITextStyle> = omit(textFragments[0], "text");

    for (let i = 1; i < textFragments.length; i++) {
      const fragment = textFragments[i];

      for (const key of Object.keys(baseStyle) as (keyof ITextStyle)[]) {
        if (baseStyle[key] !== fragment[key]) {
          baseStyle[key] = undefined;
        }
      }
    }

    return baseStyle;
  }

  updateTextFragmentsStyle(
    startIndex: number,
    endIndex: number,
    newStyle: Partial<ITextStyle>
  ) {
    const textFragment = this.editor.text.getTextFragment(endIndex);

    if (textFragment?.text === "\n") {
      endIndex++;
    }

    for (let i = startIndex; i < endIndex; i++) {
      this.editor.text.setTextFragmentStyle(i, newStyle);
    }
  }

  adjustSelectedFontSize(
    startIndex: number,
    endIndex: number,
    type: "plus" | "minus"
  ) {
    const textFragment = this.editor.text.getTextFragment(endIndex);

    if (textFragment?.text === "\n") {
      endIndex++;
    }

    for (let i = startIndex; i < endIndex; i++) {
      const textFragment = this.editor.text.getTextFragment(i);

      if (!textFragment) continue;

      this.editor.text.setTextFragmentStyle(i, {
        ...textFragment,
        fontSize:
          type === "plus"
            ? textFragment.fontSize + 1
            : textFragment.fontSize - 1,
      });
    }
  }

  reset() {
    this._currentStyle = undefined;
  }
}
