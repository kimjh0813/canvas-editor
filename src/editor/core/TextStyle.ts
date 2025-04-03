import { pick } from "lodash";
import { ITextStyle, TTextStyleKey } from "../types/text";
import { dispatchCurrentTextStyleUpdate } from "../utils/event";
import { getDefaultTextStyle, isValidFontSize } from "../utils/text";
import { EditorManger } from "./EditorManger";

export class TextStyle {
  textStyleKeys: TTextStyleKey[] = [
    "bold",
    "italic",
    "underline",
    "fontSize",
    "color",
    "backgroundColor",
    "fontFamily",
  ];

  private _defaultStyle: ITextStyle;
  private _currentStyle: ITextStyle | undefined;

  constructor(private editor: EditorManger, defaultFontSize: number) {
    this._defaultStyle = getDefaultTextStyle(defaultFontSize);
    this._currentStyle = undefined;
  }

  public get defaultStyle() {
    return this._defaultStyle;
  }

  public get defaultFontSize() {
    return this._defaultStyle.fontSize;
  }

  reset() {
    if (!this._currentStyle) return;

    this._currentStyle = undefined;
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
        textStyle = pick(prevTextFragment, this.textStyleKeys);
      } else if (textFragment) {
        textStyle = pick(textFragment, this.textStyleKeys);
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

    const baseStyle: Partial<ITextStyle> = pick(
      textFragments[0],
      this.textStyleKeys
    );

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

    if (
      textFragment?.text === "\n" ||
      endIndex + 1 === this.editor.text.length()
    ) {
      endIndex++;
    }

    for (let i = startIndex; i < endIndex; i++) {
      this.editor.text.setTextFragmentStyle(i, newStyle);
    }
  }

  updateTextStyle(style: Omit<Partial<ITextStyle>, "fontSize">) {
    const cursorIndex = this.editor.cursor.index;
    const textLength = this.editor.text.length();
    const isAllSelect = this.editor.select.isAllSelect();
    const isTextEmpty = textLength === 1;

    if (isAllSelect || isTextEmpty) {
      if (isTextEmpty) {
        this.editor.text.setTextFragmentStyle(0, style);
      }

      this.editor.textStyle.setDefaultStyle(style);
    }

    if (this.editor.select.selectRange === null) {
      this.editor.textStyle.setCurrentStyle(style);

      if (cursorIndex >= textLength - 1) {
        this.editor.text.setTextFragmentStyle(cursorIndex, style);
      }
    } else {
      const { start, end } = this.editor.select.selectRange;

      this.editor.textStyle.updateTextFragmentsStyle(start, end, style);

      this.editor.draw(true);
    }

    dispatchCurrentTextStyleUpdate(style);
  }

  updateFontSize(fontSize: number) {
    if (!isValidFontSize(fontSize)) return;

    const cursorIndex = this.editor.cursor.index;
    const textLength = this.editor.text.length();
    const isAllSelect = this.editor.select.isAllSelect();
    const selectRange = this.editor.select.selectRange;
    const isTextEmpty = textLength === 1;

    if (isAllSelect || isTextEmpty) {
      if (isTextEmpty) {
        this.editor.text.setTextFragmentStyle(0, { fontSize });
        this.editor.draw(true);
      }

      this.setDefaultStyle({ fontSize });
    }

    if (isTextEmpty || !selectRange) {
      const lineText = this.editor.text.getLineText(this.editor.cursor.index);
      const lineMaxFontSize = lineText?.text.length
        ? lineText.maxFontSize
        : fontSize;

      this.setCurrentStyle({ fontSize });

      this.editor.cursor.setCursor((prev) =>
        prev
          ? {
              ...prev,
              fontSize,
              lineMaxFontSize,
              isFocusCanvas: true,
            }
          : prev
      );

      if (cursorIndex >= textLength - 1) {
        this.editor.text.setTextFragmentStyle(cursorIndex, { fontSize });
        this.editor.draw(true);
      }
    } else {
      const { start, end } = selectRange;

      this.updateTextFragmentsStyle(start, end, {
        fontSize,
      });

      this.editor.draw(true);
    }

    dispatchCurrentTextStyleUpdate({ fontSize: String(fontSize) });
  }

  adjustFontSize(type: "plus" | "minus", fontSize?: number) {
    const delta = type === "plus" ? 1 : -1;
    const newFontSize = fontSize !== undefined ? fontSize + delta : undefined;

    const selectRange = this.editor.select.selectRange;
    const isAllSelect = this.editor.select.isAllSelect();

    if (selectRange) {
      if (isAllSelect && newFontSize && isValidFontSize(newFontSize)) {
        this.setDefaultStyle({
          fontSize: newFontSize,
        });
      }

      let startIndex = selectRange.start;
      let endIndex = selectRange.end;

      const textFragment = this.editor.text.getTextFragment(endIndex);
      if (textFragment?.text === "\n") {
        endIndex++;
      }

      for (let i = startIndex; i < endIndex; i++) {
        const textFragment = this.editor.text.getTextFragment(i);

        if (!textFragment) continue;

        if (!isValidFontSize(textFragment.fontSize + delta)) continue;

        this.editor.text.setTextFragmentStyle(i, {
          ...textFragment,
          fontSize: textFragment.fontSize + delta,
        });
      }

      if (newFontSize && isValidFontSize(newFontSize))
        dispatchCurrentTextStyleUpdate({
          fontSize: String(newFontSize + delta),
        });

      this.editor.draw(true);
    } else {
      newFontSize && this.updateFontSize(newFontSize);
    }
  }
}
