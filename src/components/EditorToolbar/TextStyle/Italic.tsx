import { Italic as ItalicIcon } from "lucide-react";

import { IconWrapper } from "../styled";
import { useEditor } from "../../../context/EditorContext";

interface ItalicProps {
  isItalic: boolean;
}

export function Italic({ isItalic }: ItalicProps) {
  const { editorManger } = useEditor();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    editorManger.keyEvent.italic();
  };

  return (
    <IconWrapper onClick={handleClick} $isActive={isItalic}>
      <ItalicIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
