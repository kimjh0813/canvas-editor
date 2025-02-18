import { EditorManger } from "../../editor/core/EditorManger";
import * as S from "./styled";
import { cursorState } from "../../recoil";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FontSize } from "./FontSize";

interface EditorToolbarProps {
  editorManger: EditorManger;
}

export function EditorToolbar({ editorManger }: EditorToolbarProps) {
  const setCursor = useSetRecoilState(cursorState);

  const toolbarClick = useCallback(() => {
    setCursor((prev) => {
      if (!prev) return prev;

      return { ...prev, isFocusCanvas: false };
    });
  }, [setCursor]);

  return (
    <S.EditorToolbarContainer onClick={toolbarClick}>
      <S.EditorControlWrapper>
        <FontSize editorManger={editorManger} />
      </S.EditorControlWrapper>
    </S.EditorToolbarContainer>
  );
}
