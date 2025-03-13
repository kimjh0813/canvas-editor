import { Bold as BoldIcon } from "lucide-react";

import { useSetRecoilState } from "recoil";

import { CursorStyle } from ".";
import { useEditor } from "../../../context/EditorContext";
import { cursorState } from "../../../recoil";
import { IconWrapper } from "../styled";

interface BoldProps {
  isBold: boolean;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Bold({ isBold, setCursorStyle }: BoldProps) {
  const { editorManger, draw } = useEditor();

  const setCursor = useSetRecoilState(cursorState);

  const handelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ bold: !isBold });
    }

    if (editorManger.select.selectRange === null) {
      editorManger.textStyle.setCurrentStyle({ bold: !isBold });
    } else {
      const { start, end } = editorManger.select.selectRange;

      editorManger.textStyle.updateTextFragmentsStyle(start, end, {
        bold: !isBold,
      });

      draw(true);
    }

    setCursorStyle((prev) => ({ ...prev, isBold: !isBold }));
    setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
  };

  return (
    <IconWrapper onClick={handelClick} $isActive={isBold}>
      <BoldIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
