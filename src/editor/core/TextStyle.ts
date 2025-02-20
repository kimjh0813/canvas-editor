import { EditorLayout } from "./EditorLayout";
import { EditorManger } from "./EditorManger";

export class TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize?: number;
  backgroundColor?: string;
  fontFamily: string;

  constructor(private editor: EditorManger) {
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.backgroundColor = undefined;
    this.fontSize = undefined;
    this.fontFamily = "Arial";
  }

  getTextStyle(index: number) {
    let fontSize;
    if (this.fontSize) {
      fontSize = this.fontSize;
    } else {
      const prevTextFragment = this.editor.text.getTextFragment(index - 1);
      const textFragment = this.editor.text.getTextFragment(index);

      if (prevTextFragment) {
        fontSize = prevTextFragment.fontSize;
      } else if (textFragment) {
        fontSize = textFragment.fontSize;
      } else {
        fontSize = this.editor.layout.defaultFontSize;
      }
    }

    const fontStyle = { fontSize };

    return fontStyle;
  }

  checkTextStyle(startIndex: number, endIndex: number) {
    const textFragments = this.editor.text.textFragments.slice(
      startIndex,
      endIndex
    );

    const fontSize = textFragments[0].fontSize;

    for (let i = 0; i < textFragments.length; i++) {
      if (textFragments[i].fontSize !== fontSize) {
        return undefined;
      }
    }

    return fontSize;
  }

  updateFontSize(startIndex: number, endIndex: number, type: "plus" | "minus") {
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

  updateTextFragmentsStyle(
    startIndex: number,
    endIndex: number,
    newStyle: Partial<TextStyle>
  ) {
    for (let i = startIndex; i < endIndex; i++) {
      this.editor.text.setTextFragmentStyle(i, newStyle);
    }
  }

  updateStyle(newStyle: Partial<TextStyle>) {
    Object.assign(this, newStyle);
  }

  reset() {
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.fontSize = undefined;
    this.backgroundColor = undefined;
    this.fontFamily = "Arial";
  }
}
