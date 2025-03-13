import * as S from "./styled";
import { cursorState } from "../../recoil";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FontSize } from "./FontStyle/FontSize";
import { useEditor } from "../../context/EditorContext";
import { FontBold } from "./FontStyle/FontBold";
import { FontStyle } from "./FontStyle";

export function EditorToolbar() {
  const { editorManger } = useEditor();

  const setCursor = useSetRecoilState(cursorState);

  const toolbarClick = useCallback(() => {
    editorManger.text.resetKoreanComposing();

    setCursor((prev) => {
      if (!prev) return prev;

      return { ...prev, isFocusCanvas: false };
    });
  }, [setCursor]);

  return (
    <S.EditorToolbarContainer onClick={toolbarClick}>
      <S.EditorControlWrapper>
        <FontStyle />
      </S.EditorControlWrapper>
    </S.EditorToolbarContainer>
  );
}
