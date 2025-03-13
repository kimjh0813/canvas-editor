import { Bold } from "lucide-react";

import { IconWrapper } from "../../styled";
import { useEditor } from "../../../../context/EditorContext";

import { useSetRecoilState } from "recoil";
import { cursorState } from "../../../../recoil";
import { CursorStyle } from "../FontStyle";

interface FontBoldProps {
  isBold: boolean;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function FontBold({ isBold, setCursorStyle }: FontBoldProps) {
  const { editorManger, draw } = useEditor();

  const setCursor = useSetRecoilState(cursorState);

  const handelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isAllSelect = editorManger.select.isAllSelect();

    if (isAllSelect) {
      editorManger.textStyle.setDefaultStyle({ bold: !isBold });
    }

    if (editorManger.text.length() === 0) {
      editorManger.textStyle.setDefaultStyle({ bold: !isBold });
    } else {
      if (editorManger.select.selectRange === null) {
        editorManger.textStyle.setCurrentStyle({ bold: !isBold });
      } else {
        const { start, end } = editorManger.select.selectRange;

        editorManger.textStyle.updateTextFragmentsStyle(start, end, {
          bold: !isBold,
        });

        draw(true);
      }
    }

    setCursorStyle((prev) => ({ ...prev, isBold: !isBold }));
    setCursor((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        isFocusCanvas: true,
      };
    });
  };

  return (
    <IconWrapper onClick={handelClick} $isActive={isBold}>
      <Bold width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
