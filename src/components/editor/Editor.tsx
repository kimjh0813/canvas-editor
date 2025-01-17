import { useCallback, useEffect, useMemo, useRef } from "react";
import { KeyboardHandler } from "../../utils/KeyboardHandler";
import { drawText } from "../../utils/draw";
import { useSetRecoilState } from "recoil";
import { cursorState } from "../../recoil";
import { Cursor } from "../cursor";

const isTimeCheck = false;

export const marginX = 40;
export const marginY = 40;

export function Editor() {
  const setCursor = useSetRecoilState(cursorState);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyboardHandler = useMemo(() => new KeyboardHandler(), []);

  const draw = useCallback(() => {
    const start = performance.now();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { textArr, defaultFontSize } = keyboardHandler;

    if (textArr.length < 0) return;

    drawText({
      ctx,
      textArr,
      canvasWidth: canvas.width,
      marginX,
      marginY,
      defaultFontSize,
      setCursor,
    });

    const end = performance.now();
    if (isTimeCheck)
      console.log(`draw 함수 실행 시간: ${(end - start).toFixed(2)}ms`);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardHandler.keyDown(event);
      draw();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw]);

  return (
    <div style={{ position: "relative" }}>
      <Cursor defaultFontSize={keyboardHandler.defaultFontSize} />
      <canvas
        width={794}
        height={1124}
        ref={canvasRef}
        style={{ cursor: "text", border: "1px solid black", outline: "none" }}
      />
    </div>
  );
}
