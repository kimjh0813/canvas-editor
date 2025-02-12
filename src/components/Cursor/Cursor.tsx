import { useRecoilValue } from "recoil";
import { cursorState } from "../../recoil";

import * as S from "./styled";
import { useEffect, useState } from "react";

interface CursorProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export function Cursor({ scrollContainerRef }: CursorProps) {
  const cursor = useRecoilValue(cursorState);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  useEffect(() => {
    if (!cursor) return;

    setIsBlinking(false);
    const timer = setTimeout(() => setIsBlinking(true), 1000);

    return () => clearTimeout(timer);
  }, [cursor]);

  useEffect(() => {
    if (!cursor || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const containerHeight = scrollContainer.clientHeight;
    const cursorPosition = cursor.pageIndex * (1123 + 20) + cursor.y;

    const currentScrollTop = scrollContainer.scrollTop;

    const upperBound = containerHeight * 0.3;
    const lowerBound = containerHeight * 0.7;

    if (cursorPosition < currentScrollTop + upperBound) {
      scrollContainer.scrollTo({
        top: cursorPosition - upperBound,
        behavior: "smooth",
      });
    } else if (cursorPosition > currentScrollTop + lowerBound) {
      scrollContainer.scrollTo({
        top: cursorPosition - lowerBound,
        behavior: "smooth",
      });
    }
  }, [cursor, scrollContainerRef]);

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
