import { Bold as BoldIcon } from "lucide-react";

import { useEditor } from "../../../context/EditorContext";
import { IconWrapper } from "../styled";

interface BoldProps {
  isBold: boolean;
}

export function Bold({ isBold }: BoldProps) {
  const { editorManger } = useEditor();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    editorManger.keyEvent.bold();
  };

  return (
    <IconWrapper onClick={handleClick} $isActive={isBold}>
      <BoldIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
