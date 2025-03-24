import { pick } from "lodash";
import { ILineStyle } from "../types/text";
import { EditorManger } from "./EditorManger";

export class LineStyle {
  private _defaultStyle: ILineStyle;
  private _currentStyle: ILineStyle | undefined;

  constructor(private editor: EditorManger) {
    this._defaultStyle = {
      align: "left",
    };
    this._currentStyle = undefined;
  }

  public get defaultStyle() {
    return this._defaultStyle;
  }

  setDefaultStyle(newStyle: ILineStyle) {
    this._defaultStyle = { ...this._defaultStyle, ...newStyle };
  }

  setCurrentStyle(newStyle: ILineStyle) {
    if (!this._currentStyle) {
      const _lineStyle = this.getLineStyle(this.editor.cursor.index);
      const lineStyle = _lineStyle ? _lineStyle : this._defaultStyle;

      this._currentStyle = { ...lineStyle, ...newStyle };
    } else {
      this._currentStyle = { ...this._currentStyle, ...newStyle };
    }
  }

  getLineStyle(index: number) {
    let lineStyle: ILineStyle;

    if (this._currentStyle) {
      lineStyle = this._currentStyle;
    } else {
      const prevTextFragment = this.editor.text.getTextFragment(index - 1);
      const textFragment = this.editor.text.getTextFragment(index);

      if (prevTextFragment) {
        lineStyle = pick(prevTextFragment, "align");
      } else if (textFragment) {
        lineStyle = pick(textFragment, "align");
      } else {
        lineStyle = this._defaultStyle;
      }
    }

    return lineStyle;
  }
}
