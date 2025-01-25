import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorDataManager } from "../../utils/EditorDataManager";
import { drawText } from "../../utils/draw";
import { useSetRecoilState } from "recoil";
import { cursorState } from "../../recoil";
import { Cursor } from "../cursor";
import { CanvasDataManager } from "../../utils/CanvasDataManager";

const isTimeCheck = true;
const defaultFontSize = 100;

// 지금 class구조, canvasDataManager setLineTexts와 같은 함수, pageSize, cursorPosition 처럼 setState를 넘기냐 혹은 eventListener로 관리

export function Editor() {
  const setCursor = useSetRecoilState(cursorState);

  const [pageSize, setPageSize] = useState<number>(0);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const editorDataManager = useMemo(
    () => new EditorDataManager(defaultFontSize),
    []
  );

  const canvasDataManager = useMemo(() => {
    const handler = new CanvasDataManager(
      editorDataManager,
      setPageSize,
      setCursor
    );
    setPageSize(handler.pageSize);

    return handler;
  }, []);

  const draw = useCallback(() => {
    const start = performance.now();

    drawText({
      canvasDataManager,
      canvasRefs,
    });

    const end = performance.now();
    if (isTimeCheck)
      console.log(`draw 함수 실행 시간: ${(end - start).toFixed(2)}ms`);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      editorDataManager.keyDown(event);
      draw();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw]);

  useEffect(() => {
    draw();
  }, [pageSize]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Cursor
        defaultFontSize={editorDataManager.defaultFontSize}
        marginX={canvasDataManager.marginX}
        marginY={canvasDataManager.marginY}
      />
      {[...Array(pageSize)].map((_, index) => (
        <div key={index} style={{ outline: "1px solid #c7c7c7" }}>
          <canvas
            width={794}
            height={1123}
            ref={(el) => (canvasRefs.current[index] = el)}
            style={{
              cursor: "text",
              outline: "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}
