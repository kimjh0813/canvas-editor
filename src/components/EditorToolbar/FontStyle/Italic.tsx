import { Italic as ItalicIcon } from "lucide-react";

import { IconWrapper } from "../styled";
import { useEditor } from "../../../context/EditorContext";

import { useSetRecoilState } from "recoil";
import { cursorState } from "../../../recoil";
import { CursorStyle } from "./FontStyle";

interface ItalicProps {
  isItalic: boolean;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Italic({ isItalic, setCursorStyle }: ItalicProps) {
  const { editorManger, draw } = useEditor();

  const setCursor = useSetRecoilState(cursorState);

  const handelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ italic: !isItalic });
    }

    if (editorManger.select.selectRange === null) {
      editorManger.textStyle.setCurrentStyle({ italic: !isItalic });
    } else {
      const { start, end } = editorManger.select.selectRange;

      editorManger.textStyle.updateTextFragmentsStyle(start, end, {
        italic: !isItalic,
      });

      draw(true);
    }

    setCursorStyle((prev) => ({ ...prev, isItalic: !isItalic }));
    setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
  };

  return (
    <IconWrapper onClick={handelClick} $isActive={isItalic}>
      <ItalicIcon width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
