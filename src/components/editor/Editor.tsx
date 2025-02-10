import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawText } from "../../utils/draw";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { cursorState } from "../../recoil";
import { EditorManger } from "../../utils/EditorManger";
import { Cursor } from "../cursor";

import * as S from "./styled";
import { isCursorSelector } from "../../recoil/selector";

const isTimeCheck = false;
const defaultFontSize = 30;
const marginX = 60;
const marginY = 70;

// 지금 class구조, canvasDataManager setLineTexts와 같은 함수, pageSize, cursorPosition 처럼 setState를 넘기냐 혹은 eventListener로 관리, draw useEffect pageSize

export function Editor() {
  const isCursor = useRecoilValue(isCursorSelector);

  const setCursor = useSetRecoilState(cursorState);

  const [pageSize, setPageSize] = useState<number>(0);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const editorManger = useMemo(() => {
    const handler = new EditorManger(
      defaultFontSize,
      marginX,
      marginY,
      setPageSize,
      setCursor
    );

    setPageSize(handler.pageSize);

    return handler;
  }, []);

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
    <S.MainWrapper>
      <S.CanvasContainer>
        <Cursor />
        {[...Array(pageSize)].map((_, index) => (
          <S.CanvasWrapper
            key={index}
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
      </S.CanvasContainer>
    </S.MainWrapper>
  );
}
