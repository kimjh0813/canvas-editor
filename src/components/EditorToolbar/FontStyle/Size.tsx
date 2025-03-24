import { useRef, useState } from "react";

import { isValidInteger } from "../../../utils/isValidInteger";
import { fontSizeList } from "../../../constants/toolbar";
import { DropDownContent } from "../../ui";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditor } from "../../../context/EditorContext";

import * as S from "./styled";
import { MinusIcon, PlusIcon } from "lucide-react";
import { IconWrapper } from "../styled";
import { CursorStyle } from "./FontStyle";

interface SizeProps {
  fontSize: string;
  setCursorStyle: React.Dispatch<React.SetStateAction<CursorStyle>>;
}

export function Size({ fontSize, setCursorStyle }: SizeProps) {
  const { editorManger } = useEditor();

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [animate] = useAutoAnimate({ duration: 80, easing: "linear" });

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const closeDropDown = () => {
    setIsVisible(false);
  };

  const changeFontSize = (size?: number) => {
    let _fontSize = size ? size : Number(fontSize);

    if (!isValidInteger(_fontSize) || _fontSize < 1) {
      setCursorStyle((prev) => ({
        ...prev,
        fontSize: String(editorManger.textStyle.defaultFontSize),
      }));

      return;
    }

    if (_fontSize > 120) _fontSize = 120;

    editorManger.textStyle.updateFontSize(_fontSize);
    closeDropDown();
  };

  const handleIconClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "plus" | "minus"
  ) => {
    e.stopPropagation();

    editorManger.keyEvent.stepFontSize(type);
  };

  return (
    <S.SizeContainer>
      <IconWrapper onClick={(e) => handleIconClick(e, "minus")} $size={24}>
        <MinusIcon width={16} height={16} />
      </IconWrapper>
      <S.RelativeContainer>
        <div ref={triggerRef} onClick={() => setIsVisible(true)}>
          <S.SizeInput
            ref={inputRef}
            value={fontSize}
            onChange={({ target: { value } }) => {
              setCursorStyle((prev) => ({
                ...prev,
                fontSize: value,
              }));
            }}
            onFocus={(e) => e.target.select()}
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
                inputRef.current?.blur();
              }}
            >
              <S.SizeListWrapper>
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
              </S.SizeListWrapper>
            </DropDownContent>
          )}
        </div>
      </S.RelativeContainer>
      <IconWrapper onClick={(e) => handleIconClick(e, "plus")} $size={24}>
        <PlusIcon width={16} height={16} />
      </IconWrapper>
    </S.SizeContainer>
  );
}
