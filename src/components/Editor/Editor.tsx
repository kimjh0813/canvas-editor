import { useMemo, useRef, useState } from "react";

import { useSetRecoilState } from "recoil";

import { cursorState } from "../../recoil";
import { EditorManger } from "../../utils/EditorManger";
import { EditorCanvas } from "../EditorCanvas";
import { Cursor } from "../Cursor";

import * as S from "./styled";
import { EditorToolbar } from "../EditorToolbar";

const defaultFontSize = 14;
const marginX = 96;
const marginY = 96;

// 지금 class구조, canvasDataManager setLineTexts와 같은 함수, pageSize, cursorPosition 처럼 setState를 넘기냐 혹은 eventListener로 관리, draw useEffect pageSize

export function Editor() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const setCursor = useSetRecoilState(cursorState);

  const [pageSize, setPageSize] = useState<number>(0);

  const editorManger = useMemo(() => {
    const handler = new EditorManger(
      defaultFontSize,
      marginX,
      marginY,
      setPageSize,
      setCursor
    );

    setPageSize(handler.pageSize);

    return handler;
  }, []);

  return (
    <S.MainWrapper>
      {/* <div
        onClick={() => editorManger.addRandomAlphabetText(5000)}
        style={{ cursor: "pointer" }}
      >
        btn
      </div> */}
      <EditorToolbar editorManger={editorManger} />
      <S.CanvasScrollContainer ref={scrollContainerRef}>
        <S.Line />
        <S.CanvasContainer>
          <Cursor scrollContainerRef={scrollContainerRef} />
          <EditorCanvas pageSize={pageSize} editorManger={editorManger} />
          {/* tab wrapper*/}
          <div style={{ paddingBottom: 40 }} />
        </S.CanvasContainer>
      </S.CanvasScrollContainer>
    </S.MainWrapper>
  );
}
