import { ILineText } from "../types/text";
import { getPageInfoFromY } from "../utils/mouse";
import { getFontStyle } from "../utils/text";
import { EditorManger } from "./EditorManger";

const scrollBarWidth = 16;

export class CanvasMouseManager {
  private _downIndex: number | null;
  private _isDragging: boolean;
  private _scrollContainerRef: React.RefObject<HTMLDivElement>;

  constructor(
    private editor: EditorManger,
    scrollContainerRef: React.RefObject<HTMLDivElement>
  ) {
    this._downIndex = null;
    this._isDragging = false;
    this._scrollContainerRef = scrollContainerRef;
  }

  hasScroll() {
    const scrollContainer = this._scrollContainerRef.current;
    if (scrollContainer) {
      return scrollContainer.scrollHeight > scrollContainer.clientHeight;
    }
    return false;
  }

  getTargetIndex(mouseX: number, mouseY: number, lineTextArr: ILineText[]) {
    const lastLine = lineTextArr[lineTextArr.length - 1];

    if (lastLine.y + lastLine.maxFontSize * 1.48 < mouseY)
      return lastLine.endIndex + 1;

    let closestLine: ILineText | null = null;
    let isLastLine = false;

    if (mouseY < this.editor.layout.marginY) {
      closestLine = lineTextArr[0];
      isLastLine = lineTextArr.length === 1;
    } else {
      for (let i = 0; i < lineTextArr.length; i++) {
        const line = lineTextArr[i];
        if (mouseY >= line.y && mouseY <= line.y + line.maxFontSize * 1.48) {
          closestLine = line;
          i === lineTextArr.length - 1 && (isLastLine = true);
          break;
        }
      }
    }

    if (!closestLine) return;

    let x = closestLine.x;
    let cursorIndex: number | null = null;

    for (let i = 0; i < closestLine.text.length; i++) {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      const textFragment = closestLine.text[i];

      ctx.font = getFontStyle(textFragment);

      const textWidth = ctx.measureText(textFragment.text).width;
      const charMid = x + textWidth / 2;

      if (mouseX >= x && mouseX <= x + textWidth) {
        if (mouseX < charMid) {
          cursorIndex =
            closestLine.endIndex - (closestLine.text.length - i) + 1;
        } else {
          cursorIndex =
            closestLine.endIndex - (closestLine.text.length - i) + 1 + 1;
        }
        break;
      }

      x += textWidth;
    }

    if (cursorIndex === null) {
      if (mouseX > this.editor.layout.marginX) {
        // if lastLine +1
        cursorIndex = isLastLine
          ? closestLine.endIndex + 1
          : closestLine.endIndex;
      } else {
        cursorIndex = closestLine.endIndex - closestLine.text.length + 1;
      }
    }

    return cursorIndex;
  }

  down(mouseX: number, mouseY: number, pageIndex: number) {
    this._isDragging = true;
    this.editor.select.clearSelectedRange();
    this.editor.text.resetKoreanComposing();

    console.log(this.editor.text.lineTexts);

    if (this.editor.prevRowIndex !== null) this.editor.setPrevRowIndex(null);

    const lineTextArr = this.editor.text.lineTexts.get(pageIndex);

    if (!lineTextArr || lineTextArr.length === 0) {
      this.editor.cursor.resetCursorToPage(pageIndex);
      return;
    }

    const targetIndex = this.getTargetIndex(mouseX, mouseY, lineTextArr);

    if (targetIndex === undefined) return;

    this._downIndex = targetIndex;
    this.editor.cursor.setCursorIndex(targetIndex);

    this.editor.draw(false);
  }

  move(e: MouseEvent) {
    if (!this._isDragging || this._downIndex === null) return;

    const scrollContainer = this._scrollContainerRef.current;

    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const paddingTop = parseFloat(
      window.getComputedStyle(scrollContainer).paddingTop
    );

    const canvasWidth = this.editor.layout.canvasWidth;

    let targetIndex: number | undefined;

    const innerHeight = window.innerHeight;
    const innerWidth = this.hasScroll()
      ? window.innerWidth - scrollBarWidth
      : window.innerWidth;

    const pageMargin = (innerWidth - canvasWidth) / 2;

    let mouseX = Math.round(e.pageX - pageMargin);
    const mouseY = e.pageY - containerTop - paddingTop + scrollTop;

    if (e.pageX < pageMargin) mouseX = 0;
    if (e.pageX > innerWidth - pageMargin) mouseX = canvasWidth;

    if (e.pageY < containerTop + paddingTop) {
      targetIndex = 0;
    } else if (e.pageY > innerHeight) {
      targetIndex = this.editor.text.length();
    } else {
      const { canvasHeight, pageSize } = this.editor.layout;

      const pageInfo = getPageInfoFromY(mouseY, canvasHeight, pageSize);
      if (pageInfo === null) return;

      const lineTextArr = this.editor.text.lineTexts.get(pageInfo.pageIndex);

      if (!lineTextArr) return;

      targetIndex = this.getTargetIndex(mouseX, pageInfo.y, lineTextArr);
    }

    if (targetIndex === undefined) return;

    let startIndex =
      targetIndex > this._downIndex ? this._downIndex : targetIndex;
    let endIndex =
      targetIndex > this._downIndex ? targetIndex : this._downIndex;

    this.editor.select.updateSelectedRange(startIndex, endIndex);
    this.editor.cursor.setCursorIndex(targetIndex);

    this.editor.draw(false);
  }

  up() {
    if (!this._isDragging) return;

    this._isDragging = false;
    this._downIndex = null;
  }
}
