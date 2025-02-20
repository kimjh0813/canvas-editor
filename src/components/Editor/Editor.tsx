import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSetRecoilState } from "recoil";

import { cursorState } from "../../recoil";
import { EditorCanvas } from "../EditorCanvas";
import { Cursor } from "../Cursor";

import * as S from "./styled";
import { EditorToolbar } from "../EditorToolbar";
import { EditorManger } from "../../editor/core/EditorManger";
import { EditorContext, useEditor } from "../../context/EditorContext";
import { drawText } from "../../editor/utils/draw";

const defaultFontSize = 14;
const marginX = 96;
const marginY = 96;

// 지금 class구조, canvasDataManager setLineTexts와 같은 함수, pageSize, cursorPosition 처럼 setState를 넘기냐 혹은 eventListener로 관리, draw useEffect pageSize

export function Editor() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const setCursor = useSetRecoilState(cursorState);

  const [pageSize, setPageSize] = useState<number>(0);

  const editorManger = useMemo(() => {
    const handler = new EditorManger(
      defaultFontSize,
      marginX,
      marginY,
      setCursor,
      setPageSize
    );

    setPageSize(handler.layout.pageSize);

    return handler;
  }, []);

  useEffect(() => {
    editorManger.cursor.resetCursorPosition();
  }, []);

  const draw = useCallback((shouldUpdateText: boolean) => {
    drawText({
      editorManger,
      canvasRefs,
      shouldUpdateText,
    });
  }, []);

  return (
    <EditorContext.Provider value={{ editorManger, draw }}>
      <S.MainWrapper>
        {/* <div
        onClick={() => editorManger.addRandomAlphabetText(5000)}
        style={{ cursor: "pointer" }}
      >
        btn
      </div> */}
        <EditorToolbar />
        <S.CanvasScrollContainer ref={scrollContainerRef}>
          <S.CanvasContainer>
            <Cursor scrollContainerRef={scrollContainerRef} />
            <EditorCanvas pageSize={pageSize} canvasRefs={canvasRefs} />
            {/* tab wrapper*/}
            <div style={{ paddingBottom: 40 }} />
          </S.CanvasContainer>
        </S.CanvasScrollContainer>
      </S.MainWrapper>
    </EditorContext.Provider>
  );
}
