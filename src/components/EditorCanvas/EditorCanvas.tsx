import { useEffect } from "react";

import { useRecoilValue } from "recoil";

import { isCursorSelector } from "../../recoil/selector";

import * as S from "./styled";
import { useEditor } from "../../context/EditorContext";
import { useMouseHandlers } from "../../hooks";

interface EditorCanvasProps {
  pageSize: number;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
}

export function EditorCanvas({ canvasRefs, pageSize }: EditorCanvasProps) {
  const { editorManger, draw } = useEditor();

  const isCursor = useRecoilValue(isCursorSelector);

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useMouseHandlers(
    editorManger,
    draw
  );

  useEffect(() => {
    if (isCursor) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCursor, handleMouseUp]);

  useEffect(() => {
    if (!isCursor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const shouldUpdateText = editorManger.keyEvent.keyDown(event);

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
          key={index}
          $canvasWidth={editorManger.layout.canvasWidth}
          $canvasHeight={editorManger.layout.canvasHeight}
        >
          <canvas
            width={editorManger.layout.canvasWidth}
            height={editorManger.layout.canvasHeight}
            onMouseDown={(e) => {
              e.preventDefault();
              handleMouseDown(e, index);
            }}
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </S.CanvasWrapper>
      ))}
    </>
  );
}
