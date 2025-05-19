import { pick } from "lodash";
import { ILineStyle, TLineStyleKey } from "../types/text";
import { EditorManger } from "./EditorManger";
import { dispatchCurrentLineStyleUpdate } from "../utils/event";
import { getDefaultLineStyle } from "../utils/text";

export class LineStyle {
  lineStyleKeys: TLineStyleKey[] = ["align"];

  private _defaultStyle: ILineStyle;

  constructor(private editor: EditorManger) {
    this._defaultStyle = getDefaultLineStyle();
  }

  public get defaultStyle() {
    return this._defaultStyle;
  }

  setDefaultStyle(newStyle: Partial<ILineStyle>) {
    this._defaultStyle = { ...this._defaultStyle, ...newStyle };
  }

  getLineStyle(index: number) {
    let lineStyle: ILineStyle;

    const textFragment = this.editor.text.getTextFragment(index);
    const prevTextFragment = this.editor.text.getTextFragment(index - 1);

    if (textFragment) {
      lineStyle = pick(textFragment, this.lineStyleKeys);
    } else if (prevTextFragment) {
      lineStyle = pick(prevTextFragment, this.lineStyleKeys);
    } else {
      lineStyle = this._defaultStyle;
    }

    return lineStyle;
  }

  updateLineStyle(newStyle: Partial<ILineStyle>) {
    const cursorIndex = this.editor.cursor.index;

    const lineText = this.editor.text.getLineText(cursorIndex);
    const textLength = this.editor.text.length();
    const textFragments = this.editor.text.textFragments;

    const isAllSelect = this.editor.select.isAllSelect();
    const isTextEmpty = textLength === 1;

    if (!lineText) {
      if (isAllSelect || isTextEmpty) {
        this.setDefaultStyle(newStyle);
        dispatchCurrentLineStyleUpdate(newStyle);
      }

      return;
    }

    const selectRange = this.editor.select.selectRange;

    let startIndex;
    let endIndex;

    if (selectRange) {
      startIndex = selectRange.start;
      endIndex = selectRange.end;
    } else {
      startIndex = cursorIndex;
      endIndex = cursorIndex;
    }

    if (isAllSelect && selectRange) {
      startIndex = 0;
      endIndex = textLength - 1;
    } else {
      while (startIndex > 0 && textFragments[startIndex - 1].text !== "\n") {
        startIndex--;
      }

      while (
        endIndex < textLength - 1 &&
        textFragments[endIndex].text !== "\n"
      ) {
        endIndex++;
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      this.editor.text.setTextFragmentStyle(i, newStyle);
    }

    this.editor.draw(true);

    dispatchCurrentLineStyleUpdate(newStyle);
  }

  checkLineStyle(startIndex: number, endIndex: number) {
    const textFragments = this.editor.text.textFragments.slice(
      startIndex,
      endIndex
    );

    if (textFragments.length === 0) return;

    const baseStyle: Partial<ILineStyle> = pick(
      textFragments[0],
      this.lineStyleKeys
    );

    for (let i = 1; i < textFragments.length; i++) {
      const fragment = textFragments[i];

      for (const key of Object.keys(baseStyle) as (keyof ILineStyle)[]) {
        if (baseStyle[key] !== fragment[key]) {
          baseStyle[key] = undefined;
        }
      }
    }

    return baseStyle;
  }
}
