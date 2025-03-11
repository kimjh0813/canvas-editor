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

    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex === 0) return;

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    if (isCommandKey(event)) {
      this.editor.text.resetKoreanComposing();

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
    } else {
      if (this.editor.text.isKoreanComposing) {
        const prevTextFragment = this.editor.text.getTextFragment(
          cursorIndex - 1
        );

        if (!prevTextFragment) return;

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

      if (this.editor.cursor.index === 0)
        this.editor.cursor.resetCursorPosition();
    }
  }

  enter() {
    this.editor.select.deleteSelectedRange();

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.index;

    const prevTextFragment = this.editor.text.getTextFragment(cursorIndex - 1);
    const textFragment = this.editor.text.getTextFragment(cursorIndex);

    if (
      prevTextFragment &&
      prevTextFragment.text !== "\n" &&
      textFragment?.text === "\n"
    ) {
      this.editor.text.setTextFragmentStyle(cursorIndex, {
        fontSize: prevTextFragment.fontSize,
      });
    }

    const textStyle = this.editor.textStyle.getTextStyle(cursorIndex);

    this.editor.text.insert(cursorIndex, 0, {
      text: "\n",
      ...textStyle,
    });

    this.editor.cursor.setCursorIndex(cursorIndex + 1, false);
  }

  arrowUp(event: KeyboardEvent) {
    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex === 0) {
      if (!event.shiftKey) this.editor.select.clearSelectedRange("start");
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
      if (selectRange) {
        const { start, end } = selectRange;

        if (isCommandKey(event)) {
          startIndex = targetIndex;
          endIndex = cursorIndex === start ? end : start;
        } else if (targetIndex >= start) {
          endIndex = targetIndex;
        } else {
          startIndex = targetIndex;
          endIndex = cursorIndex > start ? start : end;
        }
      } else {
        startIndex = targetIndex;
        endIndex = cursorIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      const result = this.editor.select.clearSelectedRange("start");

      if (result) return;
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  }

  arrowDown(event: KeyboardEvent) {
    this.editor.textStyle.reset();

    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex >= this.editor.text.length()) {
      if (!event.shiftKey) this.editor.select.clearSelectedRange("end");

      return;
    }

    let targetIndex = 0;

    if (isCommandKey(event)) {
      targetIndex = this.editor.text.length();
    } else {
      const lineTextArr = this.editor.getLineTextArray().flat();

      for (let i = 0; i < lineTextArr.length; i++) {
        const lineText = lineTextArr[i];

        if (lineText.endIndex >= cursorIndex) {
          if (i === lineTextArr.length - 1) {
            targetIndex = this.editor.text.length();
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
              if (
                i === lineTextArr.length - 2 &&
                targetIndex >= this.editor.text.length()
              ) {
                targetIndex = this.editor.text.length();
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
      if (selectRange) {
        const { start, end } = selectRange;

        if (isCommandKey(event)) {
          startIndex = cursorIndex === end ? start : end;
          endIndex = targetIndex;
        } else if (end >= targetIndex) {
          startIndex = targetIndex;
        } else {
          startIndex = cursorIndex > start ? start : end;
          endIndex = targetIndex;
        }
      } else {
        startIndex = cursorIndex;
        endIndex = targetIndex;
      }

      this.editor.select.updateSelectedRange(startIndex, endIndex);
    } else {
      const result = this.editor.select.clearSelectedRange("end");

      if (result) return;
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  }

  arrowLeft = (event: KeyboardEvent) => {
    this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex === 0) {
      if (!event.shiftKey) this.editor.select.clearSelectedRange("start");
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
      const result = this.editor.select.clearSelectedRange("start");

      if (result) return;
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  };

  arrowRight = (event: KeyboardEvent) => {
    this.editor.setPrevRowIndex(null);

    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex >= this.editor.text.length()) {
      if (!event.shiftKey) this.editor.select.clearSelectedRange("end");
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
      const result = this.editor.select.clearSelectedRange("end");

      if (result) return;
    }

    this.editor.cursor.setCursorIndex(targetIndex);
  };

  selectAll() {
    if (this.editor.text.length() === 0) return;

    this.editor.select.updateSelectedRange(0, this.editor.text.length());

    this.editor.cursor.setCursorIndex(this.editor.text.length());
  }
}
