import { useEditor } from "../../../context/EditorContext";

import * as S from "./styled";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DropDownContent } from "../../ui";

import { fontFamilyList } from "../../../constants/toolbar";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface BgColorProps {
  fontFamily: string;
}

export function FontFamily({ fontFamily }: BgColorProps) {
  const { editorManger } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);
  const [animate] = useAutoAnimate({ duration: 40, easing: "linear" });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const closeDropDown = () => {
    setIsVisible(false);
  };

  const handleClick = (_fontFamily: string) => {
    editorManger.textStyle.updateTextStyle({ fontFamily: _fontFamily });

    closeDropDown();
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
              onClickOutside={closeDropDown}
              style={{ width: "220px" }}
            >
              <S.FamilyListWrapper>
                {fontFamilyList.map((f) => {
                  return (
                    <div
                      key={f}
                      className="family-item"
                      style={{ fontFamily: f }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(f);
                      }}
                    >
                      <div className="icon-wrapper">
                        {fontFamily === f && <Check width={16} height={16} />}
                      </div>
                      <div>{f}</div>
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
