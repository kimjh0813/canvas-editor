import { ITextFragment } from "../types/text";
import { EditorManger } from "./EditorManger";

interface ChangeSet {
  index: number;
  fragments: ITextFragment[];
  timestamp: number;
  type: "insert" | "delete";
}

export class History {
  private stack: ChangeSet[] = [];
  private pointer = -1;
  private lastPushTime = 0;
  private historyInterval = 2000;

  constructor(private editor: EditorManger) {}

  pushTextChange(
    index: number,
    fragments: ITextFragment[],
    type: "insert" | "delete"
  ) {
    const lastChange = this.stack[this.pointer];
    const currentTime = Date.now();

    const isEnter = fragments[0].text === "\n";
    const lastIsEnter = lastChange?.fragments[0]?.text === "\n";
    const isSameType = lastChange && lastChange.type === type;
    const isMergeTimeCheck =
      this.stack.length > 0 &&
      currentTime - this.lastPushTime < this.historyInterval;

    const canMergeType = type === "insert" || type === "delete";
    const isMerge =
      isMergeTimeCheck &&
      isSameType &&
      canMergeType &&
      !isEnter &&
      !lastIsEnter;

    if (isMerge) {
      lastChange.fragments.push(...fragments);
    } else {
      // 새로운 ChangeSet 추가
      if (this.pointer < this.stack.length - 1) {
        this.stack = this.stack.slice(0, this.pointer + 1);
      }

      this.stack.push({
        index,
        fragments,
        timestamp: currentTime,
        type,
      });
      this.pointer++;

      this.lastPushTime = currentTime;
    }

    console.log(this.stack);
  }

  undo() {
    if (this.pointer >= 0) {
      const change = this.stack[this.pointer];
      this.pointer--;

      if (change.type === "insert") {
        this.editor.text.remove(change.index, change.fragments.length, false);
        this.editor.cursor.setCursorIndex(change.index, false);
      } else if (change.type === "delete") {
        const itemLength = change.fragments.length;

        this.editor.text.insert(change.index, change.fragments, false);

        this.editor.cursor.setCursorIndex(change.index + itemLength, false);
      }

      this.editor.draw(true);
    }
  }

  redo() {
    if (this.pointer < this.stack.length - 1) {
      this.pointer++;
      const change = this.stack[this.pointer];

      const itemLength = change.fragments.length;

      if (change.type === "delete") {
        this.editor.text.remove(change.index, itemLength, false);
        this.editor.cursor.setCursorIndex(change.index, false);
      } else if (change.type === "insert") {
        this.editor.text.insert(change.index, change.fragments, false);

        this.editor.cursor.setCursorIndex(change.index + itemLength, false);
      }

      this.editor.draw(true);
    }
  }
}
