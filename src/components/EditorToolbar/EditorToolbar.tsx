import * as S from "./styled";
import { cursorState } from "../../recoil";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { useEditor } from "../../context/EditorContext";
import { TextStyle } from "./TextStyle";
import { LineStyle } from "./LineStyle";
import { Github, Redo, Undo } from "lucide-react";
import { HistoryManager } from "./HistoryManager";

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
        <HistoryManager />
        <TextStyle />
        <LineStyle />
        <S.GithubLinkWrapper
          to="https://github.com/kimjh0813/canvas-editor"
          target="_blank"
        >
          <Github width={20} height={20} />
        </S.GithubLinkWrapper>
      </S.EditorControlWrapper>
    </S.EditorToolbarContainer>
  );
}
