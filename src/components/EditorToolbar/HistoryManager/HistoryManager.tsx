import { Redo, Undo } from "lucide-react";
import { IconWrapper } from "../styled";
import * as S from "./styled";
import { useEditor } from "../../../context/EditorContext";

export function HistoryManager() {
  const { editorManger } = useEditor();

  return (
    <S.Container>
      <IconWrapper
        onClick={(e) => {
          e.stopPropagation();
          editorManger.history.undo();
        }}
      >
        <Undo width={16} height={16} strokeWidth={2} />
      </IconWrapper>
      <IconWrapper
        onClick={(e) => {
          e.stopPropagation();
          editorManger.history.redo();
        }}
      >
        <Redo width={16} height={16} strokeWidth={2} />
      </IconWrapper>
    </S.Container>
  );
}
