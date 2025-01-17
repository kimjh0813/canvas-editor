// interface CursorPosition {
//   page: number;
//   index: number;
// }

export interface TextFragment {
  text: string;
  fontSize: number;
  isSelect: boolean;
}

export class KeyboardHandler {
  defaultFontSize = 18;

  textArr: TextFragment[] = [];
  cursorIndex: number = 0;
  // cursorPosition: CursorPosition = { page: 1, index: 0 };

  console() {
    console.log(this.textArr);
    console.log(this.cursorIndex);
  }

  addText(text: string) {
    const newText: TextFragment = {
      text,
      fontSize: this.defaultFontSize,
      isSelect: false,
    };

    this.textArr.push(newText);

    this.cursorIndex++;
  }

  deleteText() {
    if (this.cursorIndex === 0) return;

    this.textArr.splice(this.cursorIndex - 1, this.cursorIndex);

    if (this.textArr.length === 0) {
      this.notifyTextCleared();
    }

    this.cursorIndex--;
  }

  enter() {
    this.textArr.push({
      text: "\n",
      fontSize: this.defaultFontSize,
      isSelect: false,
    });

    this.cursorIndex++;
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

  notifyTextCleared() {
    window.dispatchEvent(new Event("notifyTextCleared", {}));
  }
}
