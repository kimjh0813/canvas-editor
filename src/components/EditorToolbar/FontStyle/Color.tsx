import { Bold as BoldIcon } from "lucide-react";

import { useSetRecoilState } from "recoil";

import { CursorStyle } from ".";
import { useEditor } from "../../../context/EditorContext";
import { cursorState } from "../../../recoil";
import { IconWrapper } from "../styled";
import { ColorPicker } from "../../ColorPicker";

import * as S from "./styled";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DropDownContent } from "../../ui";

export default function BaselineIcon({ color }: { color: string }) {
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
  color: string;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Color({ color, setCursorStyle }: ColorProps) {
  const { editorManger, draw } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);

  const [animate] = useAutoAnimate({ duration: 40, easing: "linear" });

  const setCursor = useSetRecoilState(cursorState);

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handelClick = (color: string) => {
    const isAllSelect = editorManger.select.isAllSelect();
    const isTextEmpty = editorManger.text.length() === 0;

    if (isAllSelect || isTextEmpty) {
      editorManger.textStyle.setDefaultStyle({ color });
    }

    if (editorManger.select.selectRange === null) {
      editorManger.textStyle.setCurrentStyle({ color });
    } else {
      const { start, end } = editorManger.select.selectRange;

      editorManger.textStyle.updateTextFragmentsStyle(start, end, {
        color,
      });

      draw(true);
    }

    setCursorStyle((prev) => ({ ...prev, color }));
    setCursor((prev) => (prev ? { ...prev, isFocusCanvas: true } : prev));
    setIsVisible(false);
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
              onClickOutside={() => {
                setIsVisible(false);
              }}
              style={{ width: "243px" }}
            >
              <ColorPicker selectColor={color} handelClick={handelClick} />
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
    </S.ColorContainer>
  );
}
