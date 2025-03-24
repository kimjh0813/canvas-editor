import { useEditor } from "../../../context/EditorContext";

import { IconWrapper } from "../styled";
import { ColorPicker } from "../../ColorPicker";

import * as S from "./styled";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DropDownContent } from "../../ui";

function BaselineIcon({ color = "transparent" }: { color?: string }) {
  return (
    <svg
      style={{
        borderBottom: `3px solid ${color}`,
        transform: "translateY(-1px)",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-baseline"
    >
      <path d="m6 16 6-12 6 12" style={{ transform: "translateY(3px)" }} />
      <path d="M8 12h8" style={{ transform: "translateY(3px)" }} />
    </svg>
  );
}

interface ColorProps {
  color?: string;
}

export function Color({ color }: ColorProps) {
  const { editorManger } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);

  const [animate] = useAutoAnimate({ duration: 40, easing: "linear" });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const closeDropDown = () => {
    setIsVisible(false);
  };

  const handelClick = (selectColor: string) => {
    editorManger.textStyle.updateTextStyle({ color: selectColor });

    closeDropDown();
  };

  return (
    <S.ColorContainer>
      <S.RelativeContainer>
        <IconWrapper
          ref={triggerRef}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          <BaselineIcon color={color} />
        </IconWrapper>
        <div ref={animate}>
          {isVisible && (
            <DropDownContent
              triggerRef={triggerRef}
              onClickOutside={closeDropDown}
              style={{ width: "218px", padding: "14px 12px" }}
            >
              <ColorPicker selectColor={color} handelClick={handelClick} />
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
    </S.ColorContainer>
  );
}
