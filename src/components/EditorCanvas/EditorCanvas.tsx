import { useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";

import { isCursorSelector } from "../../recoil/selector";

import * as S from "./styled";
import { useEditor } from "../../context/EditorContext";
import { useMouseHandlers } from "../../hooks";
import { isCommandKey } from "../../editor/utils/key";
import { codeToHangul, functionKey } from "../../constants/key";

interface EditorCanvasProps {
  pageSize: number;
  canvasRefs: React.MutableRefObject<(HTMLCanvasElement | null)[]>;
}

export function EditorCanvas({ canvasRefs, pageSize }: EditorCanvasProps) {
  const { editorManger, draw } = useEditor();

  const isCursor = useRecoilValue(isCursorSelector);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1) {
        if (isCommandKey(event) && event.shiftKey) {
          event.preventDefault();
        } else if (isCommandKey(event)) {
          switch (event.code) {
            case "KeyR":
              location.reload();
              break;
            case "KeyV":
              break;
            default:
              event.preventDefault();
              return;
          }
        }
      } else {
        if (!functionKey.includes(event.key)) event.preventDefault();
      }
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
      <input
        ref={inputRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          left: "-9999px",
        }}
        onKeyDown={(e) => {
          if (isCommandKey(e) && e.key === "v") {
            return;
          }

          e.preventDefault();

          const map = codeToHangul[e.code];
          let result = "";

          if (e.key === "Process" && map) {
            result = e.shiftKey ? map.shift : map.normal;
          } else {
            result = e.key;
          }
          const fakeEvent = {
            ...e,
            key: result,
          } as React.KeyboardEvent<HTMLInputElement>;

          editorManger.keyEvent.keyDown(fakeEvent);
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
              handleMouseDown(e, index);
            }}
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </S.CanvasWrapper>
      ))}
    </>
  );
}
