import { useEffect, useRef, useState } from "react";

import { useRecoilState } from "recoil";
import { cursorState } from "../../../recoil";
import { isValidInteger } from "../../../utils/isValidInteger";
import { fontSizeList } from "../../../constants/toolbar";
import { DropDownContent } from "../../ui";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditor } from "../../../context/EditorContext";

import * as S from "./styled";
import { MinusIcon, PlusIcon } from "lucide-react";

export function FontSize() {
  const { editorManger, draw } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [animate] = useAutoAnimate({ duration: 80, easing: "linear" });

  const [cursor, setCursor] = useRecoilState(cursorState);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>(
    String(editorManger.layout.defaultFontSize)
  );

  const changeFontSize = (size?: number, type?: "plus" | "minus") => {
    let _fontSize = size ? size : Number(fontSize);

    if (!isValidInteger(_fontSize) || _fontSize === 0) {
      setFontSize(String(editorManger.layout.defaultFontSize));
      return;
    }

    if (_fontSize > 120) {
      _fontSize = 120;
      setFontSize("120");
    }

    const isAllSelect = editorManger.select.isAllSelect();

    if (isAllSelect) {
      editorManger.layout.setDefaultFontSize(_fontSize);
      setFontSize(String(_fontSize));
    }

    if (editorManger.cursor.index === 0 && editorManger.text.length() === 0) {
      editorManger.layout.setDefaultFontSize(_fontSize);

      setCursor((prev) => {
        if (!prev) {
          setFontSize(String(_fontSize));
          return prev;
        }

        return {
          ...prev,
          fontSize: _fontSize,
          lineMaxFontSize: _fontSize,
          isFocusCanvas: true,
        };
      });
    } else {
      if (editorManger.select.selectRange === null) {
        editorManger.textStyle.updateStyle({ fontSize: _fontSize });

        setCursor((prev) => {
          if (!prev) {
            setFontSize(String(_fontSize));
            return prev;
          }

          return {
            ...prev,
            fontSize: _fontSize,
            isFocusCanvas: true,
          };
        });
      } else {
        const { start, end } = editorManger.select.selectRange;

        editorManger.textStyle.updateTextFragmentsStyle(start, end, {
          fontSize: _fontSize,
        });
        setCursor((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            isFocusCanvas: true,
          };
        });

        draw(true);
      }
    }

    setIsVisible(false);
  };

  const handleIconClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "plus" | "minus"
  ) => {
    e.stopPropagation();

    const selectRange = editorManger.select.selectRange;

    if (selectRange) {
      const isAllSelect = editorManger.select.isAllSelect();

      if (fontSize) {
        const _fontSize =
          type === "plus" ? Number(fontSize) + 1 : Number(fontSize) - 1;

        if (isAllSelect) {
          editorManger.layout.setDefaultFontSize(_fontSize);
        }

        setFontSize(String(_fontSize));
      }

      const _fontSize = fontSize
        ? type === "plus"
          ? Number(fontSize) + 1
          : Number(fontSize) - 1
        : "";

      setFontSize(String(_fontSize));

      editorManger.textStyle.updateFontSize(
        selectRange.start,
        selectRange.end,
        type
      );

      setCursor((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          isFocusCanvas: true,
        };
      });

      draw(true);
    } else {
      const _fontSize =
        type === "plus" ? Number(fontSize) + 1 : Number(fontSize) - 1;

      changeFontSize(_fontSize, type);
    }
  };

  useEffect(() => {
    if (!cursor) return;

    const selectRange = editorManger.select.selectRange;

    if (selectRange) {
      const _fontSize = editorManger.textStyle.checkTextStyle(
        selectRange.start,
        selectRange.end
      );

      setFontSize(_fontSize ? String(_fontSize) : "");
    } else {
      setFontSize(String(cursor.fontSize));
    }
  }, [cursor]);

  return (
    <S.Container>
      <S.IconWrapper onClick={(e) => handleIconClick(e, "minus")}>
        <MinusIcon width={16} height={16} />
      </S.IconWrapper>
      <S.RelativeContainer>
        <div ref={triggerRef} onClick={() => setIsVisible(true)}>
          <S.FontSizeInput
            ref={inputRef}
            value={fontSize}
            onChange={({ target: { value } }) => {
              setFontSize(value);
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
      <S.IconWrapper onClick={(e) => handleIconClick(e, "plus")}>
        <PlusIcon width={16} height={16} />
      </S.IconWrapper>
    </S.Container>
  );
}
