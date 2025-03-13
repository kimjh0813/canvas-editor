import { useRecoilValue } from "recoil";
import { useEditor } from "../../../context/EditorContext";
import { VerticalDivider } from "../styled";
import { FontBold } from "./FontBold";

import { cursorState } from "../../../recoil";
import { useEffect, useState } from "react";
import { FontSize } from "./FontSize";
import { isEqual } from "lodash";

export interface CursorStyle {
  fontSize: string;
  isBold: boolean;
}

export function FontStyle() {
  const { editorManger } = useEditor();

  const cursor = useRecoilValue(cursorState);

  const [cursorStyle, setCursorStyle] = useState<CursorStyle>({
    fontSize: "",
    isBold: false,
  });

  useEffect(() => {
    if (!cursor) return;

    let newCursorStyle: CursorStyle;

    const selectRange = editorManger.select.selectRange;

    if (selectRange) {
      const cTextStyle = editorManger.textStyle.checkTextStyle(
        selectRange.start,
        selectRange.end
      );

      newCursorStyle = {
        isBold: !!cTextStyle?.bold,
        fontSize: cTextStyle?.fontSize ? String(cTextStyle.fontSize) : "",
      };
    } else {
      const fontStyle = editorManger.textStyle.getTextStyle(cursor.index);

      newCursorStyle = {
        isBold: !!fontStyle.bold,
        fontSize: String(fontStyle.fontSize || ""),
      };
    }

    if (!isEqual(cursorStyle, newCursorStyle)) {
      setCursorStyle(newCursorStyle);
    }
  }, [cursor]);

  return (
    <>
      <VerticalDivider />
      <FontSize
        fontSize={cursorStyle.fontSize}
        setCursorStyle={setCursorStyle}
      />
      <VerticalDivider />
      <FontBold isBold={cursorStyle.isBold} setCursorStyle={setCursorStyle} />
      <VerticalDivider />
    </>
  );
}
