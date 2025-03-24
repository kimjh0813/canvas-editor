import { useRecoilState, useRecoilValue } from "recoil";
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
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: string;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
}

export function FontStyle() {
  const { editorManger } = useEditor();

  const [cursor, setCursor] = useRecoilState(cursorState);

  const [cursorStyle, setCursorStyle] = useState<CursorStyle>({
    fontFamily: "Arial",
    fontSize: "",
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });

  useEffect(() => {
    const handleCursorStyleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<CursorStyle>;

      setCursorStyle((prev) => ({
        ...prev,
        ...detail,
      }));

      setCursor((prev) => {
        if (!prev || !prev.isFocusCanvas) return prev;

        return { ...prev, isFocusCanvas: true };
      });
    };

    window.addEventListener(
      "editor:cursorStyleChange",
      handleCursorStyleChange
    );

    return () => {
      window.removeEventListener(
        "editor:cursorStyleChange",
        handleCursorStyleChange
      );
    };
  }, [setCursor]);

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
        bold: !!cTextStyle?.bold,
        italic: !!cTextStyle?.italic,
        underline: !!cTextStyle?.underline,
        color: cTextStyle?.color ?? "#000000",
        backgroundColor: cTextStyle?.backgroundColor,
      };
    } else {
      const textStyle = editorManger.textStyle.getTextStyle(cursor.index);

      newCursorStyle = {
        fontFamily: textStyle.fontFamily,
        fontSize: String(textStyle.fontSize || ""),
        bold: !!textStyle.bold,
        italic: !!textStyle.italic,
        underline: !!textStyle?.underline,
        color: textStyle.color,
        backgroundColor: textStyle?.backgroundColor,
      };
    }

    if (!isEqual(cursorStyle, newCursorStyle)) {
      setCursorStyle(newCursorStyle);
    }
  }, [cursor]);

  return (
    <>
      <VerticalDivider />
      <Family fontFamily={cursorStyle.fontFamily} />
      <VerticalDivider />
      <Size fontSize={cursorStyle.fontSize} setCursorStyle={setCursorStyle} />
      <VerticalDivider />
      <Bold isBold={cursorStyle.bold} />
      <Italic isItalic={cursorStyle.italic} />
      <Underline isUnderline={cursorStyle.underline} />
      <Color color={cursorStyle.color} />
      <BgColor bgColor={cursorStyle.backgroundColor} />
      <VerticalDivider />
    </>
  );
}
