interface CursorPosition {
  page: number;
  index: number;
}

export interface TextFragment {
  text: string;
  fontSize: number;
  isSelect?: boolean;
}

export class KeyboardHandler extends EventTarget {
  defaultFontSize = 16;

  textArr: (TextFragment | "enter")[] = [];
  cursorPosition: CursorPosition = { page: 1, index: 0 };

  console() {
    console.log(this.textArr);
    console.log(this.cursorPosition);
  }

  addText(text: string) {
    // const { index } = this.cursorPosition;

    const lineText = this.textArr;

    const newText: TextFragment = {
      text,
      fontSize: this.defaultFontSize,
      isSelect: false,
    };

    lineText.push(newText);

    this.cursorPosition.index++;
  }

  deleteText() {
    const { index } = this.cursorPosition;

    if (index === 0) return;

    const lineText = this.textArr;

    lineText.splice(index - 1, index);

    this.cursorPosition.index--;
  }

  changeEvent() {
    this.dispatchEvent(new Event("textChange", {}));
  }

  enter() {
    const lineText = this.textArr;

    lineText.push("enter");

    this.cursorPosition.index++;
  }

  setBarPosition() {}

  keyDown(event: KeyboardEvent) {
    if (event.key.length === 1) {
      if (event.code === "Space") {
        event.preventDefault();
      }

      this.addText(event.key);
    } else {
      switch (event.key) {
        case "Backspace":
          this.deleteText();
          break;
        case "Enter":
          this.enter();
          break;
        case "ArrowDown":
          break;
        case "ArrowUp":
          break;
        case "ArrowLeft":
          break;
        case "ArrowRight":
          break;
        default:
          console.log(`Unhandled special key: ${event.key}`);
          break;
      }
    }
  }
}
