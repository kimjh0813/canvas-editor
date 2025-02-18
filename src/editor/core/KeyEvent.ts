import Hangul from "hangul-js";

import { isCommandKey } from "../utils/key";
import { EditorManger } from "./EditorManger";
import { functionKey } from "../../constants/key";

export class KeyEvent {
  constructor(private editor: EditorManger) {}

  keyDown(event: KeyboardEvent) {
    // for change textArr
    let result = false;

    if (!functionKey.includes(event.key)) event.preventDefault();

    if (event.key.length === 1) {
      if (isCommandKey(event)) {
        this.editor.text.resetKoreanComposing();
        switch (event.code) {
          case "KeyA":
            this.selectAll();
            break;
          case "KeyR":
            location.reload();
            break;
          default:
            break;
        }
      } else {
        result = true;
        this.editor.text.addText(event);
      }

      return result;
    } else {
      switch (event.key) {
        case "Backspace":
          this.backSpace(event);
          result = true;
          break;
        case "Enter":
          this.enter();
          this.editor.text.resetKoreanComposing();
          result = true;
          break;
        case "ArrowDown":
          this.arrowDown(event);
          this.editor.text.resetKoreanComposing();
          break;
        case "ArrowUp":
          this.arrowUp(event);
          this.editor.text.resetKoreanComposing();
          break;
        case "ArrowLeft":
          this.arrowLeft(event);
          this.editor.text.resetKoreanComposing();
          break;
        case "ArrowRight":
          this.arrowRight(event);
          this.editor.text.resetKoreanComposing();
          break;
        default:
          console.log(`Unhandled special key: ${event.key}`);
          break;
      }

      return result;
    }
  }

  backSpace(event: KeyboardEvent) {
    const result = this.editor.select.deleteSelectedRange();

    if (result) return;

    const cursorIndex = this.editor.cursor.getCursorIndex();

    if (cursorIndex === 0) return;

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    if (isCommandKey(event)) {
      const lineTextArr = this.editor.getLineTextArray().flat();

      let startIndex;

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= cursorIndex || i === lineTextArr.length - 1) {
          startIndex = lineText.endIndex - lineText.text.length + 1;
          break;
        }
      }

      if (startIndex !== undefined) {
        this.editor.text.remove(startIndex, cursorIndex - startIndex);
        this.editor.cursor.setCursorIndex(startIndex, false);
      }

      if (this.editor.text.length() === 0) {
        this.editor.cursor.resetCursorPosition();
      }

      return;
    }

    if (this.editor.text.isKoreanComposing) {
      const cursorIndex = this.editor.cursor.getCursorIndex();

      const prevTextFragment = this.editor.text.getTextFragment(
        cursorIndex - 1
      );
      const decomposed = Hangul.d(prevTextFragment.text);

      if (decomposed.length > 1) {
        decomposed.pop();
        this.editor.text.setTextFragment(cursorIndex - 1, {
          ...prevTextFragment,
          text: Hangul.a(decomposed),
        });
      } else {
        this.editor.text.resetKoreanComposing();
        this.editor.text.deleteText();
      }
    } else {
      this.editor.text.deleteText();
    }
  }

  enter() {
    this.editor.select.deleteSelectedRange();

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.getCursorIndex();

    this.editor.text.insert(cursorIndex, 0, {
      text: "\n",
      fontSize: this.editor.layout.defaultFontSize,
    });

    this.editor.cursor.setCursorIndex(cursorIndex + 1, false);
  }

  arrowUp(event: KeyboardEvent) {
    const cursorIndex = this.editor.cursor.getCursorIndex();

    if (cursorIndex === 0 && !event.shiftKey) {
      this.editor.select.clearSelectedRange();

      return;
    }

    let targetIndex = 0;

    const lineTextArr = this.editor.getLineTextArray().flat();

    if (isCommandKey(event)) {
      targetIndex = 0;
    } else {
      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        // endIndex가 cursorIndex보다 크거나 혹은 마지막 줄일때(가장 끝에 커서가 잡혀있을때는 글자가 있는공간이 아니라 글자를 작성할 공간 인덱스에 있음)
        if (lineText.endIndex >= cursorIndex || i === lineTextArr.length - 1) {
          if (i === 0) {
            targetIndex = 0;
          } else {
            const targetLineText = lineTextArr[i - 1];

            if (this.editor.prevRowIndex === null)
              this.editor.setPrevRowIndex(
                cursorIndex - (targetLineText.endIndex + 1)
              );

            const prevRowIndex = this.editor.prevRowIndex ?? 0;

            const targetRowStartIndex =
              targetLineText.endIndex - targetLineText.text.length + 1;

            targetIndex = targetRowStartIndex + prevRowIndex;

            if (targetLineText.endIndex < targetIndex) {
              targetIndex = targetLineText.endIndex;
            }
          }
          break;
        }
      }
    }

    let startIndex;
    let endIndex;

    const selectRange = this.editor.select.selectRange;

    if (event.shiftKey) {
      if (selectRange && selectRange.start <= targetIndex) {
        endIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        selectRange &&
        selectRange.start > targetIndex
      ) {
        startIndex = targetIndex;
        endIndex = endIndex =
          selectRange.end > cursorIndex ? selectRange.end : selectRange.start;
      } else {
        startIndex = targetIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      this.editor.select.clearSelectedRange();
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  }

  arrowDown(event: KeyboardEvent) {
    const cursorIndex = this.editor.cursor.getCursorIndex();
    const textLength = this.editor.text.length();

    if (cursorIndex >= textLength && !event.shiftKey) {
      this.editor.select.clearSelectedRange();
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      targetIndex = textLength;
    } else {
      const lineTextArr = this.editor.getLineTextArray().flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= cursorIndex) {
          if (i === lineTextArr.length - 1) {
            targetIndex = textLength;
          } else {
            const targetLineText = lineTextArr[i + 1];

            if (this.editor.prevRowIndex === null)
              this.editor.setPrevRowIndex(
                cursorIndex - (lineText.endIndex - lineText.text.length + 1)
              );

            const prevRowIndex = this.editor.prevRowIndex ?? 0;

            const targetRowStartIndex =
              targetLineText.endIndex - targetLineText.text.length + 1;

            targetIndex = targetRowStartIndex + prevRowIndex;

            if (targetLineText.endIndex < targetIndex) {
              if (i === lineTextArr.length - 2 && targetIndex >= textLength) {
                targetIndex = textLength;
              } else {
                targetIndex = targetLineText.endIndex;
              }
            }
          }

          break;
        }
      }
    }

    let startIndex;
    let endIndex;

    const selectRange = this.editor.select.selectRange;

    if (event.shiftKey) {
      if (selectRange && selectRange.end >= targetIndex) {
        startIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        selectRange &&
        selectRange.end < targetIndex
      ) {
        startIndex =
          selectRange.start < cursorIndex ? selectRange.start : selectRange.end;
        endIndex = targetIndex;
      } else {
        endIndex = targetIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      this.editor.select.clearSelectedRange();
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  }

  arrowLeft = (event: KeyboardEvent) => {
    const cursorIndex = this.editor.cursor.getCursorIndex();

    if (cursorIndex === 0 && !event.shiftKey) {
      this.editor.select.clearSelectedRange();
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      const lineTextArr = this.editor.getLineTextArray().flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= cursorIndex || i === lineTextArr.length - 1) {
          if (i === 0) {
            targetIndex = 0;
          } else {
            targetIndex = lineText.endIndex - lineText.text.length + 1;
          }

          break;
        }
      }
    } else {
      targetIndex = cursorIndex - 1;
    }

    if (targetIndex === cursorIndex) return;

    let startIndex;
    let endIndex;

    const selectRange = this.editor.select.selectRange;

    if (event.shiftKey) {
      if (selectRange && selectRange.start <= targetIndex) {
        endIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        selectRange &&
        selectRange.start > targetIndex
      ) {
        startIndex = targetIndex;
        endIndex =
          selectRange.end > cursorIndex ? selectRange.end : selectRange.start;
      } else {
        startIndex = targetIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      this.editor.select.clearSelectedRange();
    }
    this.editor.setPrevRowIndex(null);
    this.editor.cursor.setCursorIndex(targetIndex);
  };

  arrowRight = (event: KeyboardEvent) => {
    const cursorIndex = this.editor.cursor.getCursorIndex();
    const textLength = this.editor.text.length();

    if (cursorIndex >= textLength && !event.shiftKey) {
      this.editor.select.clearSelectedRange();
      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      const lineTextArr = this.editor.getLineTextArray().flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= cursorIndex) {
          targetIndex =
            i === lineTextArr.length - 1
              ? lineText.endIndex + 1
              : lineText.endIndex;

          break;
        }
      }
    } else {
      targetIndex = cursorIndex + 1;
    }

    if (targetIndex === cursorIndex) return;

    let startIndex;
    let endIndex;

    const selectRange = this.editor.select.selectRange;

    if (event.shiftKey) {
      if (selectRange && selectRange.end >= targetIndex) {
        startIndex = targetIndex;
      } else if (
        isCommandKey(event) &&
        selectRange &&
        selectRange.end < targetIndex
      ) {
        startIndex =
          selectRange.start < cursorIndex ? selectRange.start : selectRange.end;
        endIndex = targetIndex;
      } else {
        endIndex = targetIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      this.editor.select.clearSelectedRange();
    }
    this.editor.setPrevRowIndex(null);
    this.editor.cursor.setCursorIndex(targetIndex);
  };

  selectAll() {
    const textLength = this.editor.text.length();
    if (textLength === 0) return;

    this.editor.select.updateSelectedRange(0, textLength);

    this.editor.cursor.setCursorIndex(0);
  }
}
