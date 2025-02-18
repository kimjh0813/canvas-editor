import { useCallback, useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { isCursorSelector } from "../../recoil/selector";

import * as S from "./styled";
import { EditorManger } from "../../editor/core/EditorManger";
import { drawText } from "../../editor/utils/draw";

interface EditorCanvasProps {
  pageSize: number;
  editorManger: EditorManger;
}

export function EditorCanvas({ pageSize, editorManger }: EditorCanvasProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const isCursor = useRecoilValue(isCursorSelector);

  const draw = useCallback((shouldUpdateText: boolean) => {
    drawText({
      editorManger,
      canvasRefs,
      shouldUpdateText,
    });
  }, []);

  useEffect(() => {
    if (!isCursor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const shouldUpdateText = editorManger.keyEvent.keyDown(event);
      console.log(shouldUpdateText);

      draw(shouldUpdateText);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw, isCursor]);

  useEffect(() => {
    draw(false);
  }, [pageSize, isCursor]);

  return (
    <>
      {[...Array(pageSize)].map((_, index) => (
        <S.CanvasWrapper
          key={uuidv4()}
          $canvasWidth={editorManger.layout.canvasWidth}
          $canvasHeight={editorManger.layout.canvasHeight}
        >
          <canvas
            width={editorManger.layout.canvasWidth}
            height={editorManger.layout.canvasHeight}
            onClick={(e) => {
              editorManger.canvasClick(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY,
                index
              );

              draw(false);
            }}
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </S.CanvasWrapper>
      ))}
    </>
  );
}
