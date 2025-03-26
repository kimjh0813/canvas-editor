import { Underline as UnderlineIcon } from "lucide-react";

import { useEditor } from "../../../context/EditorContext";

import { IconWrapper } from "../styled";

interface UnderlineProps {
  isUnderline: boolean;
}

export function Underline({ isUnderline }: UnderlineProps) {
  const { editorManger } = useEditor();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    editorManger.keyEvent.underLine();
  };

  return (
    <IconWrapper onClick={handleClick} $isActive={isUnderline}>
      <UnderlineIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
