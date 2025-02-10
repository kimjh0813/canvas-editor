import { useRecoilValue } from "recoil";
import { cursorState } from "../../recoil";

import * as S from "./styled";
import { useEffect, useState } from "react";

export function Cursor() {
  const cursor = useRecoilValue(cursorState);

  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  useEffect(() => {
    if (!cursor) return;

    setIsBlinking(false);
    const timer = setTimeout(() => setIsBlinking(true), 1000);

    return () => clearTimeout(timer);
  }, [cursor]);

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
