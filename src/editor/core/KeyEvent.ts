import Hangul from "hangul-js";

import { isCommandKey } from "../utils/key";
import { EditorManger } from "./EditorManger";
import { functionKey } from "../../constants/key";
import { convertHTMLToText, convertTextToHTML } from "../utils/text";
import { ITextFragment } from "../types/text";

export class KeyEvent {
  constructor(private editor: EditorManger) {}

  async keyDown(event: KeyboardEvent) {
    // for change textArr
    let shouldUpdateText = false;

    if (event.key.length === 1) {
      if (isCommandKey(event)) {
        this.editor.text.resetKoreanComposing();
        switch (event.code) {
          case "KeyC":
            this.copy();
            break;
          case "KeyX":
            shouldUpdateText = true;
            await this.cut();
            break;
          case "KeyA":
            event.preventDefault();
            this.selectAll();
            break;
          case "KeyR":
            location.reload();
            break;
          default:
            return;
        }
      } else {
        shouldUpdateText = true;
        this.editor.text.addText(event);
      }
    } else {
      switch (event.key) {
        case "Backspace":
          shouldUpdateText = true;
          this.backSpace(event);
          break;
        case "Enter":
          shouldUpdateText = true;
          this.enter();
          this.editor.text.resetKoreanComposing();
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
        case "F12":
          this.arrowRight(event);
          this.editor.text.resetKoreanComposing();
          break;
        default:
          event.preventDefault();
          console.log(`Unhandled special key: ${event.key}`);
          return;
      }
    }

    this.editor.draw(shouldUpdateText);
  }

  backSpace(event: KeyboardEvent) {
    const result = this.editor.select.deleteSelectedRange();

    if (result) return;

    const cursorIndex = this.editor.cursor.index;

    if (cursorIndex === 0) return;

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    if (isCommandKey(event)) {
      this.editor.text.resetKoreanComposing();

      const lineTextArr = this.editor.text.getLineTextArray().flat();

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

  async copy() {
    const selectRange = this.editor.select.selectRange;
    if (!selectRange) return;

    const selectedText = this.editor.text.textFragments.slice(
      selectRange.start,
      selectRange.end
    );

    const htmlString = convertTextToHTML(selectedText);

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([selectedText.map((t) => t.text).join("")], {
          type: "text/plain",
        }),
        "text/html": new Blob([htmlString], { type: "text/html" }),
      }),
    ]);
  }

  async cut() {
    await this.copy();

    this.editor.select.deleteSelectedRange();
  }

  async paste(event?: ClipboardEvent) {
    try {
      let htmlText = "";
      let plainText = "";
      console.log(event);

      if (event?.clipboardData) {
        event.preventDefault();
        htmlText = event.clipboardData.getData("text/html");
        plainText = event.clipboardData.getData("text/plain");
      } else {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          if (item.types.includes("text/html")) {
            const blob = await item.getType("text/html");
            htmlText = await blob.text();
          } else if (item.types.includes("text/plain")) {
            const blob = await item.getType("text/plain");
            plainText = await blob.text();
          }
        }
      }

      let textFragments: ITextFragment[];

      if (htmlText) {
        textFragments = convertHTMLToText(
          htmlText,
          this.editor.textStyle.defaultStyle
        );
      } else {
        const textStyle = this.editor.textStyle.getTextStyle(
          this.editor.cursor.index
        );

        textFragments = plainText
          .split("")
          .map((char) => ({ text: char, ...textStyle }));
      }

      this.editor.text.addTexts(textFragments);
      this.editor.draw(true);
    } catch (error) {
      console.error(error);
    }
  }

  arrowUp(event: KeyboardEvent) {
    const cursorIndex = this.editor.cursor.index;

    const isEnd = this.editor.select.arrowClearSelectRange(
      event.shiftKey,
      "start"
    );
    if (isEnd) return;

    const targetIndex = this.editor.text.getRelativeLineTargetIndex(
      isCommandKey(event),
      "up"
    );

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

    const isEnd = this.editor.select.arrowClearSelectRange(
      event.shiftKey,
      "end"
    );
    if (isEnd) return;

    const targetIndex = this.editor.text.getRelativeLineTargetIndex(
      isCommandKey(event),
      "down"
    );

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

    const isEnd = this.editor.select.arrowClearSelectRange(
      event.shiftKey,
      "start"
    );
    if (isEnd) return;

    const targetIndex = this.editor.text.getCurrentLineTargetIndex(
      isCommandKey(event),
      "left"
    );

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

    const isEnd = this.editor.select.arrowClearSelectRange(
      event.shiftKey,
      "end"
    );
    if (isEnd) return;

    const targetIndex = this.editor.text.getCurrentLineTargetIndex(
      isCommandKey(event),
      "right"
    );

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
    const textLength = this.editor.text.length();

    if (textLength === 0) return;

    this.editor.select.updateSelectedRange(0, textLength);
    this.editor.cursor.setCursorIndex(textLength);
  }
}
