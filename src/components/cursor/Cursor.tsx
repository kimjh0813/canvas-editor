import { useRecoilState } from "recoil";
import { cursorState } from "../../recoil";

import * as S from "./styled";
import { useEffect, useState } from "react";
import { marginX, marginY } from "../editor";

export function Cursor({ defaultFontSize }: { defaultFontSize: number }) {
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
      setCursor({ fontSize: defaultFontSize, x: marginX, y: marginY });
    };

    window.addEventListener("notifyTextCleared", handleTextCleared);

    return () => {
      window.removeEventListener("notifyTextCleared", handleTextCleared);
    };
  }, [defaultFontSize]);

  if (!cursor) return null;

  return (
    <S.Cursor
      $x={cursor.x}
      $y={cursor.y}
      $fontSize={cursor.fontSize}
      $isBlinking={isBlinking}
    />
  );
}
