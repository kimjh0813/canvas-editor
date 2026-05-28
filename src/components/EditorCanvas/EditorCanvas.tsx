import { useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";

import { isCursorSelector } from "../../recoil/selector";

import { useEditor } from "../../context/EditorContext";
import { isCommandKey, isSkipPreventDefault } from "../../editor/utils/key";
import { useMouseHandlers } from "../../hooks";
import * as S from "./styled";

interface EditorCanvasProps {
  pageSize: number;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
}

export function EditorCanvas({ canvasRefs, pageSize }: EditorCanvasProps) {
  const { editorManger, draw } = useEditor();

  const isCursor = useRecoilValue(isCursorSelector);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useMouseHandlers(editorManger);

  useEffect(() => {
    if (isCursor) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isCursor]);

  useEffect(() => {
    if (!isCursor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === inputRef.current) return;
      if (isSkipPreventDefault(e)) return;

      if (isCommandKey(e) && e.code === "KeyR") {
        location.reload();
        return;
      }

      e.preventDefault();
    };

    const handlePaste = (event: ClipboardEvent) => {
      editorManger.keyEvent.paste(event);
    };

    const preventFocusOut = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", preventFocusOut, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", preventFocusOut, true);
    };
  }, [draw, isCursor]);

  useEffect(() => {
    draw(false);
  }, [pageSize, isCursor]);

  return (
    <>
      <input
        ref={inputRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          left: "-9999px",
        }}
        onKeyDown={(e) => {
          if (isSkipPreventDefault(e)) return;
          if (isComposingRef.current || e.nativeEvent.isComposing) return;
          if (e.key === "Process") return;

          e.preventDefault();
          editorManger.keyEvent.keyDown(e);
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
          editorManger.keyEvent.startComposition();
        }}
        onCompositionUpdate={(e) => {
          editorManger.keyEvent.updateComposition(e.data);
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;

          const text = e.data || e.currentTarget.value;
          editorManger.keyEvent.endComposition(text);
          e.currentTarget.value = "";
        }}
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
              inputRef.current?.focus();
              handleMouseDown(e, index);
            }}
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </S.CanvasWrapper>
      ))}
    </>
  );
}
