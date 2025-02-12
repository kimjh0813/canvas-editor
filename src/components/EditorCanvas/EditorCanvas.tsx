import { useCallback, useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { EditorManger } from "../../utils/EditorManger";
import { drawText } from "../../utils/draw";
import { isCursorSelector } from "../../recoil/selector";

import * as S from "./styled";

const isTimeCheck = false;

interface EditorCanvasProps {
  pageSize: number;
  editorManger: EditorManger;
}

export function EditorCanvas({ pageSize, editorManger }: EditorCanvasProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const isCursor = useRecoilValue(isCursorSelector);

  const draw = useCallback(() => {
    const start = performance.now();

    drawText({
      editorManger,
      canvasRefs,
    });

    const end = performance.now();
    if (isTimeCheck)
      console.log(`draw 함수 실행 시간: ${(end - start).toFixed(2)}ms`);
  }, []);

  useEffect(() => {
    if (!isCursor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isDraw = editorManger.keyDown(event);

      isDraw && draw();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw, isCursor]);

  useEffect(() => {
    draw();
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
              const isDraw = editorManger.canvasClick(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY,
                index
              );

              isDraw && draw();
            }}
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </S.CanvasWrapper>
      ))}
    </>
  );
}
