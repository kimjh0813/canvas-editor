import { useSetRecoilState } from "recoil";

import { useEditor } from "../../../context/EditorContext";
import { cursorState } from "../../../recoil";
import * as S from "./styled";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DropDownContent } from "../../ui";
import { CursorStyle } from "./FontStyle";

import { fontFamilyList } from "../../../constants/toolbar";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface BgColorProps {
  fontFamily: string;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Family({ fontFamily, setCursorStyle }: BgColorProps) {
  const { editorManger, draw } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);

  const [animate] = useAutoAnimate({ duration: 40, easing: "linear" });

  const setCursor = useSetRecoilState(cursorState);

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handelClick = (family: string) => {
    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ fontFamily: family });
    }

    if (editorManger.select.selectRange === null) {
      editorManger.textStyle.setCurrentStyle({ fontFamily: family });
    } else {
      const { start, end } = editorManger.select.selectRange;

      editorManger.textStyle.updateTextFragmentsStyle(start, end, {
        fontFamily: family,
      });

      draw(true);
    }

    setCursorStyle((prev) => ({ ...prev, fontFamily: family }));
    setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
    setIsVisible(false);
  };

  return (
    <S.ColorContainer>
      <S.RelativeContainer>
        <S.FamilyTriggerWrapper
          ref={triggerRef}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          <div className="family-text">{fontFamily}</div>
          {isVisible ? (
            <ChevronUp width={16} height={16} />
          ) : (
            <ChevronDown width={16} height={16} />
          )}
        </S.FamilyTriggerWrapper>

        <div ref={animate}>
          {isVisible && (
            <DropDownContent
              triggerRef={triggerRef}
              onClickOutside={() => {
                setIsVisible(false);
              }}
              style={{ width: "220px" }}
            >
              <S.FamilyListWrapper>
                {fontFamilyList.map((_fontFamily) => {
                  return (
                    <div
                      key={_fontFamily}
                      className="family-item"
                      style={{ fontFamily: _fontFamily }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handelClick(_fontFamily);
                      }}
                    >
                      <div className="icon-wrapper">
                        {fontFamily === _fontFamily && (
                          <Check width={16} height={16} />
                        )}
                      </div>
                      <div>{_fontFamily}</div>
                    </div>
                  );
                })}
              </S.FamilyListWrapper>
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
    </S.ColorContainer>
  );
}
