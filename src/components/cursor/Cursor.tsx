import { useRecoilState } from "recoil";
import { cursorState } from "../../recoil";

import * as S from "./styled";
import { useEffect, useState } from "react";
import { EditorDataManager } from "../../utils/EditorDataManager";
import { CanvasDataManager } from "../../utils/CanvasDataManager";
import { cursorArrowEvent } from "../../hooks/cursorArrowEvent";

interface CursorProps {
  editorDataManager: EditorDataManager;
  canvasDataManager: CanvasDataManager;
}

export function Cursor({ editorDataManager, canvasDataManager }: CursorProps) {
  const [cursor, setCursor] = useRecoilState(cursorState);

  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  useEffect(() => {
    if (!cursor) return;

    setIsBlinking(false);
    const timer = setTimeout(() => setIsBlinking(true), 1000);

    return () => clearTimeout(timer);
  }, [cursor]);

  cursorArrowEvent({ canvasDataManager, editorDataManager });

  useEffect(() => {
    const handleTextCleared = () => {
      setCursor({
        fontSize: editorDataManager.defaultFontSize,
        x: canvasDataManager.marginX,
        y: canvasDataManager.marginY,
        pageIndex: 0,
      });
    };

    window.addEventListener("notifyTextCleared", handleTextCleared);

    return () => {
      window.removeEventListener("notifyTextCleared", handleTextCleared);
    };
  }, [editorDataManager.defaultFontSize]);

  if (!cursor) return null;

  return (
    <S.Cursor
      $pageIndex={cursor.pageIndex}
      $x={cursor.x}
      $y={cursor.y}
      $fontSize={cursor.fontSize}
      $isBlinking={isBlinking}
    />
  );
}
