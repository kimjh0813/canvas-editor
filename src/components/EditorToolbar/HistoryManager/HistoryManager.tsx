import { Redo, Undo } from "lucide-react";
import { IconWrapper } from "../styled";
import * as S from "./styled";
import { useEditor } from "../../../context/EditorContext";

export function HistoryManager() {
  const { editorManger } = useEditor();

  return (
    <S.Container>
      <IconWrapper
        onClick={() => {
          editorManger.history.undo();
        }}
      >
        <Undo width={16} height={16} strokeWidth={2} />
      </IconWrapper>
      <IconWrapper>
        <Redo
          onClick={() => {
            editorManger.history.redo();
          }}
          width={16}
          height={16}
          strokeWidth={2}
        />
      </IconWrapper>
    </S.Container>
  );
}
