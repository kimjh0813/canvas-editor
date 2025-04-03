import { ISelectRange } from "../types/selectRange";
import { ITextStyle } from "../types/text";
import { EditorManger } from "./EditorManger";

export class SelectRange {
  private _selectRange: ISelectRange | null;

  constructor(private editor: EditorManger) {
    this._selectRange = null;
  }

  public get selectRange() {
    return this._selectRange;
  }

  isAllSelect() {
    return (
      this._selectRange?.start === 0 &&
      this._selectRange?.end === this.editor.text.length()
    );
  }

  clearSelectedRange(type?: "start" | "end") {
    if (this._selectRange === null) return false;

    this.editor.setPrevRowIndex(null);

    const { start, end: _end } = this._selectRange;

    if (type === "start") {
      this.editor.cursor.setCursorIndex(start);
    }

    if (type === "end") {
      const end = _end === this.editor.text.length() ? _end - 1 : _end;

      this.editor.cursor.setCursorIndex(end);
    }

    this._selectRange = null;

    return true;
  }

  arrowClearSelectRange(shiftKey: boolean, type: "start" | "end") {
    const checkCursorIndex =
      type === "start"
        ? this.editor.cursor.index === 0
        : this.editor.cursor.index >= this.editor.text.length();

    if (checkCursorIndex) {
      if (!shiftKey) this.clearSelectedRange(type);

      return true;
    }

    return false;
  }

  updateSelectedRange(start?: number, end?: number) {
    if (this._selectRange?.start === start && this._selectRange?.end === end)
      return;

    const cursorIndex = this.editor.cursor.index;

    let startIndex;
    let endIndex;

    if (start !== undefined && start >= 0) {
      startIndex = start;
    } else if (this._selectRange) {
      startIndex = this._selectRange.start;
    } else {
      startIndex = cursorIndex;
    }

    if (end !== undefined && end <= this.editor.text.length()) {
      endIndex = end;
    } else if (this._selectRange) {
      endIndex = this._selectRange.end;
    } else {
      endIndex = cursorIndex;
    }

    if (startIndex === endIndex) {
      this._selectRange = null;
      return;
    }

    this._selectRange = {
      start: startIndex,
      end: endIndex,
    };
  }

  deleteSelectedRange() {
    if (this._selectRange === null) return false;

    const { start, end: _end } = this._selectRange;
    const end = _end === this.editor.text.length() ? _end - 1 : _end;

    if (this.isAllSelect()) {
      const defaultStyle = this.editor.textStyle.defaultStyle;

      const textStyle: ITextStyle = {
        ...defaultStyle,
        backgroundColor: defaultStyle.backgroundColor ?? undefined,
        bold: defaultStyle.bold ?? undefined,
        italic: defaultStyle.italic ?? undefined,
        underline: defaultStyle.underline ?? undefined,
      };

      this.editor.text.setTextFragmentStyle(end, textStyle);
    }

    this.editor.text.remove(start, end - start);

    this._selectRange = null;

    this.editor.cursor.setCursorIndex(start, false);

    return true;
  }
}
