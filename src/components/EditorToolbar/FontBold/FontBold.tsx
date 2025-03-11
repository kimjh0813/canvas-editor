import { Bold } from "lucide-react";

import { IconWrapper } from "../styled";
import { useEditor } from "../../../context/EditorContext";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { cursorState } from "../../../recoil";

interface FontBoldProps {}

export function FontBold({}: FontBoldProps) {
  const { editorManger, draw } = useEditor();

  const [cursor, setCursor] = useRecoilState(cursorState);
  const [isBold, setIsBold] = useState<boolean>(false);

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

    setIsBold(!isBold);
    setCursor((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        isFocusCanvas: true,
      };
    });
  };

  useEffect(() => {
    if (!cursor) return;
    let cursorIsBold;

    const selectRange = editorManger.select.selectRange;

    if (selectRange) {
      const cTextStyle = editorManger.textStyle.checkTextStyle(
        selectRange.start,
        selectRange.end
      );

      cursorIsBold = !!cTextStyle?.bold;
    } else {
      const fontStyle = editorManger.textStyle.getTextStyle(cursor.index);

      cursorIsBold = !!fontStyle.bold;
    }

    if (cursorIsBold !== isBold) {
      setIsBold(cursorIsBold);
    }
  }, [cursor]);

  return (
    <IconWrapper onClick={handelClick} $isActive={isBold}>
      <Bold width={16} height={16} strokeWidth={2} />
    </IconWrapper>
  );
}
