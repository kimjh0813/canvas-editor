import { useEditor } from "../../../context/EditorContext";

import { IconWrapper } from "../styled";
import { ColorPicker } from "../../ColorPicker";

import * as S from "./styled";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DropDownContent } from "../../ui";

import { DropletOff } from "lucide-react";

function BrushIcon({ color = "transparent" }: { color?: string }) {
  return (
    <svg
      style={{
        padding: "1px",
        borderBottom: `3px solid ${color}`,
        transform: "translateY(-1px)",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-baseline"
    >
      <path
        d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"
        style={{ transform: "translateY(-1px)" }}
      />
      <path
        d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"
        style={{ transform: "translateY(-1px)" }}
      />
    </svg>
  );
}

interface BgColorProps {
  bgColor?: string;
}

export function BgColor({ bgColor }: BgColorProps) {
  const { editorManger } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);

  const [animate] = useAutoAnimate({ duration: 40, easing: "linear" });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const closeDropDown = () => {
    setIsVisible(false);
  };

  const handleClick = (backgroundColor?: string) => {
    editorManger.textStyle.updateTextStyle({ backgroundColor });

    closeDropDown();
  };

  return (
    <S.ColorContainer>
      <S.RelativeContainer>
        <IconWrapper
          ref={triggerRef}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          <BrushIcon color={bgColor} />
        </IconWrapper>
        <div ref={animate}>
          {isVisible && (
            <DropDownContent
              triggerRef={triggerRef}
              onClickOutside={closeDropDown}
              style={{ width: "218px", padding: "14px 12px" }}
            >
              <S.RemoveBgColorButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(undefined);
                }}
              >
                <DropletOff width={16} height={16} />
                <span style={{ fontSize: 14 }}>없음</span>
              </S.RemoveBgColorButton>
              <ColorPicker selectColor={bgColor} handleClick={handleClick} />
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
    </S.ColorContainer>
  );
}
