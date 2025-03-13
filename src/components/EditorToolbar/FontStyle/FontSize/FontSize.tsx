import { useRef, useState } from "react";

import { useSetRecoilState } from "recoil";
import { cursorState } from "../../../../recoil";
import { isValidInteger } from "../../../../utils/isValidInteger";
import { fontSizeList } from "../../../../constants/toolbar";
import { DropDownContent } from "../../../ui";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditor } from "../../../../context/EditorContext";

import * as S from "./styled";
import { MinusIcon, PlusIcon } from "lucide-react";
import { IconWrapper } from "../../styled";
import { CursorStyle } from "../FontStyle";

interface FontSizeProps {
  fontSize: string;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function FontSize({ fontSize, setCursorStyle }: FontSizeProps) {
  const { editorManger, draw } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [animate] = useAutoAnimate({ duration: 80, easing: "linear" });

  const setCursor = useSetRecoilState(cursorState);

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const changeFontSize = (size?: number) => {
    let _fontSize = size ? size : Number(fontSize);

    if (!isValidInteger(_fontSize) || _fontSize === 0) {
      setCursorStyle((prev) => ({
        ...prev,
        fontSize: String(editorManger.textStyle.defaultFontSize),
      }));

      return;
    }

    if (_fontSize > 120) _fontSize = 120;

    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;
    const selectRange = editorManger.select.selectRange;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ fontSize: _fontSize });
    }

    if (isTextEmpty || !selectRange) {
      const lineText = editorManger.text.getLineText(editorManger.cursor.index);
      const lineMaxFontSize = lineText?.text.length
        ? lineText.maxFontSize
        : _fontSize;

      editorManger.textStyle.setCurrentStyle({ fontSize: _fontSize });

      setCursor((prev) =>
        prev
          ? {
              ...prev,
              fontSize: _fontSize,
              lineMaxFontSize,
              isFocusCanvas: true,
            }
          : prev
      );
    } else {
      editorManger.textStyle.updateTextFragmentsStyle(
        selectRange.start,
        selectRange.end,
        {
          fontSize: _fontSize,
        }
      );

      setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
      draw(true);
    }

    setCursorStyle((prev) => ({
      ...prev,
      fontSize: String(_fontSize),
    }));

    setIsVisible(false);
  };

  const handleIconClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "plus" | "minus"
  ) => {
    e.stopPropagation();

    const selectRange = editorManger.select.selectRange;
    const isAllSelect = editorManger.select.isAllSelect();
    const newFontSize = (Number(fontSize) || 0) + (type === "plus" ? 1 : -1);

    if (selectRange) {
      if (isAllSelect) {
        editorManger.textStyle.setDefaultStyle({ fontSize: newFontSize });
      }

      editorManger.textStyle.adjustSelectedFontSize(
        selectRange.start,
        selectRange.end,
        type
      );

      setCursorStyle((prev) => ({ ...prev, fontSize: String(newFontSize) }));
      setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));

      draw(true);
    } else {
      changeFontSize(newFontSize);
    }
  };

  return (
    <S.Container>
      <IconWrapper onClick={(e) => handleIconClick(e, "minus")} $size={24}>
        <MinusIcon width={16} height={16} />
      </IconWrapper>
      <S.RelativeContainer>
        <div ref={triggerRef} onClick={() => setIsVisible(true)}>
          <S.FontSizeInput
            ref={inputRef}
            value={fontSize}
            onChange={({ target: { value } }) => {
              setCursorStyle((prev) => ({
                ...prev,
                fontSize: value,
              }));
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() => {}}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                changeFontSize();
                inputRef.current?.blur();
              }
            }}
          />
        </div>
        <div ref={animate}>
          {isVisible && (
            <DropDownContent
              triggerRef={triggerRef}
              onClickOutside={() => {
                setIsVisible(false);
              }}
            >
              <S.FontSizeListWrapper>
                {fontSizeList.map((v) => (
                  <div
                    key={v}
                    className="font-size-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeFontSize(v);
                    }}
                  >
                    {v}
                  </div>
                ))}
              </S.FontSizeListWrapper>
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
      <IconWrapper onClick={(e) => handleIconClick(e, "plus")} $size={24}>
        <PlusIcon width={16} height={16} />
      </IconWrapper>
    </S.Container>
  );
}
