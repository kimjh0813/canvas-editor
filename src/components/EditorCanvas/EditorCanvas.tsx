import { useCallback, useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { EditorManger } from "../../utils/EditorManger";
import { drawText } from "../../utils/draw";
import { isCursorSelector } from "../../recoil/selector";

import * as S from "./styled";

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
      const shouldUpdateText = editorManger.keyDown(event);

      draw(shouldUpdateText);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw, isCursor]);

  useEffect(() => {
    draw(false);
  }, [pageSize]);

  return (
    <>
      {[...Array(pageSize)].map((_, index) => (
        <S.CanvasWrapper
          key={uuidv4()}
          $canvasWidth={editorManger.canvasWidth}
          $canvasHeight={editorManger.canvasHeight}
        >
          <canvas
            width={editorManger.canvasWidth}
            height={editorManger.canvasHeight}
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
