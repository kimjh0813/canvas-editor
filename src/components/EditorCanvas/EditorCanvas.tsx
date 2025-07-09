import { useEffect, useRef } from "react";

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

  const inputRef = useRef<HTMLInputElement>(null);

  const isCursor = useRecoilValue(isCursorSelector);

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useMouseHandlers(editorManger);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (isCursor) {
      input.focus();
    } else {
      input.blur();
    }
  }, [isCursor]);

  useEffect(() => {
    if (!isCursor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
    };

    const handlePaste = (event: ClipboardEvent) => {
      editorManger.keyEvent.paste(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draw, isCursor]);
  useEffect(() => {
    draw(false);
  }, [pageSize, isCursor]);

  return (
    <>
      <S.HiddenInput
        value={""}
        onKeyDown={(e) => {
          editorManger.keyEvent.keyDown(e);
        }}
        ref={inputRef}
      />
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
