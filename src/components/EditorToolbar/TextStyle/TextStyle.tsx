import { useRecoilState, useRecoilValue } from "recoil";
import { useEditor } from "../../../context/EditorContext";
import { VerticalDivider } from "../styled";
import { Bold } from "./Bold";

import { cursorState } from "../../../recoil";
import { useEffect, useState } from "react";
import { FontSize } from "./FontSize";
import { isEqual } from "lodash";
import { Italic } from "./Italic";
import { Underline } from "./Underline";
import { Color } from "./Color";
import { BgColor } from "./BgColor";
import { FontFamily } from "./FontFamily";

export interface CurrentTextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: string;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
}

export function TextStyle() {
  const { editorManger } = useEditor();

  const [cursor, setCursor] = useRecoilState(cursorState);

  const [currentTextStyle, setCurrentTextStyle] = useState<CurrentTextStyle>({
    fontFamily: "Arial",
    fontSize: "",
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });

  useEffect(() => {
    const handleCurrentTextStyleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<CurrentTextStyle>;

      setCurrentTextStyle((prev) => ({
        ...prev,
        ...detail,
      }));

      setCursor((prev) => {
        if (!prev || prev.isFocusCanvas) return prev;

        return { ...prev, isFocusCanvas: true };
      });
    };

    window.addEventListener(
      "editor:currentTextStyleChange",
      handleCurrentTextStyleChange
    );

    return () => {
      window.removeEventListener(
        "editor:currentTextStyleChange",
        handleCurrentTextStyleChange
      );
    };
  }, [setCursor]);

  useEffect(() => {
    if (!cursor) return;

    let newCursorStyle: CurrentTextStyle;

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

    if (!isEqual(currentTextStyle, newCursorStyle)) {
      setCurrentTextStyle(newCursorStyle);
    }
  }, [cursor]);

  return (
    <>
      <VerticalDivider />
      <FontFamily fontFamily={currentTextStyle.fontFamily} />
      <VerticalDivider />
      <FontSize
        fontSize={currentTextStyle.fontSize}
        setCurrentTextStyle={setCurrentTextStyle}
      />
      <VerticalDivider />
      <Bold isBold={currentTextStyle.bold} />
      <Italic isItalic={currentTextStyle.italic} />
      <Underline isUnderline={currentTextStyle.underline} />
      <Color color={currentTextStyle.color} />
      <BgColor bgColor={currentTextStyle.backgroundColor} />
      <VerticalDivider />
    </>
  );
}
