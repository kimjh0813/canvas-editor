import { Underline as UnderlineIcon } from "lucide-react";

import { useSetRecoilState } from "recoil";

import { CursorStyle } from ".";
import { useEditor } from "../../../context/EditorContext";
import { cursorState } from "../../../recoil";
import { IconWrapper } from "../styled";

interface UnderlineProps {
  isUnderline: boolean;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Underline({ isUnderline, setCursorStyle }: UnderlineProps) {
  const { editorManger, draw } = useEditor();

  const setCursor = useSetRecoilState(cursorState);

  const handelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ underline: !isUnderline });
    }

    if (editorManger.select.selectRange === null) {
      editorManger.textStyle.setCurrentStyle({ underline: !isUnderline });
    } else {
      const { start, end } = editorManger.select.selectRange;

      editorManger.textStyle.updateTextFragmentsStyle(start, end, {
        underline: !isUnderline,
      });

      draw(true);
    }

    setCursorStyle((prev) => ({ ...prev, isUnderline: !isUnderline }));
    setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
  };

  return (
    <IconWrapper onClick={handelClick} $isActive={isUnderline}>
      <UnderlineIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
