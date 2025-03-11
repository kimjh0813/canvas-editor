import * as S from "./styled";
import { cursorState } from "../../recoil";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FontSize } from "./FontSize";
import { useEditor } from "../../context/EditorContext";
import { FontBold } from "./FontBold";

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
        <S.VerticalDivider />
        <FontSize />
        <S.VerticalDivider />
        <FontBold />
        <S.VerticalDivider />
      </S.EditorControlWrapper>
    </S.EditorToolbarContainer>
  );
}
