import { EditorManger } from "../../editor/core/EditorManger";
import * as S from "./styled";

interface EditorToolbarProps {
  editorManger: EditorManger;
}

export function EditorToolbar({ editorManger }: EditorToolbarProps) {
  return <S.EditorToolbarContainer>EditorToolbar</S.EditorToolbarContainer>;
}
