import { useEffect, useState } from "react";
import { CanvasDataManager } from "../utils/CanvasDataManager";
import { EditorDataManager } from "../utils/EditorDataManager";
import { LineText } from "../types/editor";

interface CursorArrowEvent {
  editorDataManager: EditorDataManager;
  canvasDataManager: CanvasDataManager;
}

export function cursorArrowEvent({
  canvasDataManager,
  editorDataManager,
}: CursorArrowEvent) {
  const arrowUp = () => {
    const cursorIndex = editorDataManager.cursorIndex;
    if (cursorIndex === 0) return;

    const lineTextArr: LineText[] = Array.from(
      canvasDataManager.lineTexts.values()
    ).flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineTexts = lineTextArr[i];

      // endIndex가 cursorIndex보다 크거나 혹은 마지막 줄일때(가장 끝에 커서가 잡혀있을때는 글자가 있는공간이 아니라 글자를 작성할 공간 인덱스에 있음)
      if (lineTexts.endIndex >= cursorIndex || i === lineTextArr.length - 1) {
        if (i === 0) {
          editorDataManager.setCursorIndex(0);
        } else {
          const prevLineText = lineTextArr[i - 1];

          if (editorDataManager.prevRowIndex === null)
            editorDataManager.setPrevRowIndex(
              cursorIndex - (prevLineText.endIndex + 1)
            );
          const prevRowIndex = editorDataManager.prevRowIndex ?? 0;
          const prevRowStartIndex =
            prevLineText.endIndex - prevLineText.text.length + 1;

          const targetCursorIndex = prevRowStartIndex + prevRowIndex;

          editorDataManager.setCursorIndex(
            targetCursorIndex < prevLineText.endIndex
              ? targetCursorIndex
              : prevLineText.endIndex
          );
        }
        break;
      }
    }
  };

  const arrowDown = () => {
    const cursorIndex = editorDataManager.cursorIndex;
    const textLength = editorDataManager.textArr.length;
    if (cursorIndex > textLength) return;

    const lineTextArr: LineText[] = Array.from(
      canvasDataManager.lineTexts.values()
    ).flat();

    for (let i = 0; i < lineTextArr.length; i++) {
      const lineTexts = lineTextArr[i];

      if (lineTexts.endIndex >= cursorIndex) {
        if (i === lineTextArr.length - 1) {
          editorDataManager.setCursorIndex(textLength);
        } else {
          const nextLineText = lineTextArr[i + 1];

          if (editorDataManager.prevRowIndex === null)
            editorDataManager.setPrevRowIndex(
              cursorIndex - (lineTexts.endIndex - lineTexts.text.length + 1)
            );

          const prevRowIndex = editorDataManager.prevRowIndex ?? 0;
          const nextRowStartIndex =
            nextLineText.endIndex - nextLineText.text.length + 1;

          let targetCursorIndex = nextRowStartIndex + prevRowIndex;

          if (nextLineText.endIndex < targetCursorIndex) {
            if (
              i === lineTextArr.length - 2 &&
              targetCursorIndex > textLength
            ) {
              targetCursorIndex = textLength;
            } else {
              targetCursorIndex = nextLineText.endIndex;
            }
          }

          editorDataManager.setCursorIndex(targetCursorIndex);
        }
        break;
      }
    }
  };

  const arrowLeft = () => {
    editorDataManager.setPrevRowIndex(null);
    editorDataManager.setCursorIndex(editorDataManager.cursorIndex - 1);
  };

  const arrowRight = () => {
    editorDataManager.setPrevRowIndex(null);
    editorDataManager.setCursorIndex(editorDataManager.cursorIndex + 1);
  };

  useEffect(() => {
    window.addEventListener("ArrowUp", arrowUp);
    window.addEventListener("ArrowDown", arrowDown);
    window.addEventListener("ArrowLeft", arrowLeft);
    window.addEventListener("ArrowRight", arrowRight);

    return () => {
      window.removeEventListener("ArrowUp", arrowUp);
      window.removeEventListener("ArrowDown", arrowDown);
      window.removeEventListener("ArrowLeft", arrowLeft);
      window.removeEventListener("ArrowRight", arrowRight);
    };
  }, []);
}
