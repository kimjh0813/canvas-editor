import { useRecoilState } from "recoil";
import { cursorState } from "../../recoil";

import * as S from "./styled";
import { useEffect, useState } from "react";
import { EditorManger } from "../../utils/EditorManger";

interface CursorProps {
  editorManger: EditorManger;
}

export function Cursor({ editorManger }: CursorProps) {
  const [cursor, setCursor] = useRecoilState(cursorState);

  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  useEffect(() => {
    if (!cursor) return;

    setIsBlinking(false);
    const timer = setTimeout(() => setIsBlinking(true), 1000);

    return () => clearTimeout(timer);
  }, [cursor]);

  useEffect(() => {
    const handleTextCleared = () => {
      setCursor({
        fontSize: editorManger.defaultFontSize,
        x: editorManger.marginX,
        y: editorManger.marginY,
        pageIndex: 0,
      });
    };

    window.addEventListener("notifyTextCleared", handleTextCleared);

    return () => {
      window.removeEventListener("notifyTextCleared", handleTextCleared);
    };
  }, [editorManger.defaultFontSize]);

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
