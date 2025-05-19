import * as S from "./styled";
import { useEffect, useState } from "react";
import { useEditor } from "../../../context/EditorContext";
import { ILineStyle, TLineAlign } from "../../../editor/types/text";
import { useRecoilValue } from "recoil";
import { cursorState } from "../../../recoil";
import { isEqual } from "lodash";
import { Align } from "./Align";

interface ICurrentLineStyle {
  align?: TLineAlign;
}

export function LineStyle() {
  const { editorManger } = useEditor();

  const cursor = useRecoilValue(cursorState);

  const [currentLineStyle, setCurrentLineStyle] = useState<ICurrentLineStyle>({
    align: editorManger.lineStyle.defaultStyle.align,
  });

  useEffect(() => {
    const handleCurrentLineStyleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<ILineStyle>;

      setCurrentLineStyle((prev) => ({
        ...prev,
        ...detail,
      }));
    };

    window.addEventListener(
      "editor:currentLineStyleChange",
      handleCurrentLineStyleChange
    );

    return () => {
      window.removeEventListener(
        "editor:currentLineStyleChange",
        handleCurrentLineStyleChange
      );
    };
  }, []);

  useEffect(() => {
    if (!cursor) return;

    let newCursorStyle: ICurrentLineStyle;

    const selectRange = editorManger.select.selectRange;

    if (selectRange) {
      const cLineStyle = editorManger.lineStyle.checkLineStyle(
        selectRange.start,
        selectRange.end
      );

      newCursorStyle = {
        align: cLineStyle?.align,
      };
    } else {
      const lineStyle = editorManger.lineStyle.getLineStyle(cursor.index);

      newCursorStyle = { align: lineStyle.align };
    }

    if (!isEqual(currentLineStyle, newCursorStyle)) {
      setCurrentLineStyle(newCursorStyle);
    }
  }, [cursor]);

  return (
    <S.Container>
      <Align align={currentLineStyle.align} />
    </S.Container>
  );
}
