import { useRecoilValue } from "recoil";
import { useEditor } from "../../../context/EditorContext";
import { VerticalDivider } from "../styled";
import { Bold } from "./Bold";

import { cursorState } from "../../../recoil";
import { useEffect, useState } from "react";
import { Size } from "./Size";
import { isEqual } from "lodash";
import { Italic } from "./Italic";
import { Underline } from "./Underline";
import { Color } from "./Color";
import { BgColor } from "./BgColor";
import { Family } from "./Family";

export interface CursorStyle {
  fontFamily: string;
  fontSize: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  color: string;
  bgColor?: string;
}

export function FontStyle() {
  const { editorManger } = useEditor();

  const cursor = useRecoilValue(cursorState);

  const [cursorStyle, setCursorStyle] = useState<CursorStyle>({
    fontFamily: "Arial",
    fontSize: "",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    color: "#000000",
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
        fontFamily: cTextStyle?.fontFamily ?? "",
        fontSize: cTextStyle?.fontSize ? String(cTextStyle.fontSize) : "",
        isBold: !!cTextStyle?.bold,
        isItalic: !!cTextStyle?.italic,
        isUnderline: !!cTextStyle?.underline,
        color: cTextStyle?.color ?? "#000000",
        bgColor: cTextStyle?.backgroundColor,
      };
    } else {
      const fontStyle = editorManger.textStyle.getTextStyle(cursor.index);

      newCursorStyle = {
        fontFamily: fontStyle.fontFamily,
        fontSize: String(fontStyle.fontSize || ""),
        isBold: !!fontStyle.bold,
        isItalic: !!fontStyle.italic,
        isUnderline: !!fontStyle?.underline,
        color: fontStyle.color,
        bgColor: fontStyle?.backgroundColor,
      };
    }

    if (!isEqual(cursorStyle, newCursorStyle)) {
      setCursorStyle(newCursorStyle);
    }
  }, [cursor]);

  return (
    <>
      <VerticalDivider />
      <Family
        fontFamily={cursorStyle.fontFamily}
        setCursorStyle={setCursorStyle}
      />
      <VerticalDivider />
      <Size fontSize={cursorStyle.fontSize} setCursorStyle={setCursorStyle} />
      <VerticalDivider />
      <Bold isBold={cursorStyle.isBold} setCursorStyle={setCursorStyle} />
      <Italic isItalic={cursorStyle.isItalic} setCursorStyle={setCursorStyle} />
      <Underline
        isUnderline={cursorStyle.isUnderline}
        setCursorStyle={setCursorStyle}
      />
      <Color color={cursorStyle.color} setCursorStyle={setCursorStyle} />
      <BgColor bgColor={cursorStyle.bgColor} setCursorStyle={setCursorStyle} />
      <VerticalDivider />
    </>
  );
}
