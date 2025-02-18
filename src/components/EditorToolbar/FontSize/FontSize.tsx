import { useRef, useState } from "react";
import { EditorManger } from "../../../editor/core/EditorManger";
import * as S from "./styled";
import { useSetRecoilState } from "recoil";
import { cursorState } from "../../../recoil";
import { isValidInteger } from "../../../utils/isValidInteger";
import { fontSizeList } from "../../../constants/toolbar";
import { DropDown, DropDownContent } from "../../ui";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface FontSizeProps {
  editorManger: EditorManger;
}

export function FontSize({ editorManger }: FontSizeProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [animate] = useAutoAnimate({ duration: 80, easing: "linear" });

  const setCursor = useSetRecoilState(cursorState);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>(
    String(editorManger.layout.defaultFontSize)
  );

  const changeFontSize = (size?: number) => {
    let _fontSize = size ? size : Number(fontSize);

    if (!isValidInteger(_fontSize) || _fontSize === 0) {
      setFontSize(String(editorManger.layout.defaultFontSize));
      return;
    }

    if (_fontSize > 120) {
      _fontSize = 120;
      setFontSize("120");
    }

    if (
      editorManger.cursor.getCursorIndex() === 0 &&
      editorManger.text.length() === 0
    ) {
      editorManger.layout.setDefaultFontSize(_fontSize);
      setFontSize(String(_fontSize));
      setCursor((prev) => {
        if (!prev) return prev;

        return { ...prev, fontSize: _fontSize };
      });
    }
  };

  return (
    <S.RelativeContainer>
      <S.TriggerWrapper ref={triggerRef} onClick={() => setIsVisible(true)}>
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
              // editorManger.setFontSize(fontSize);
              inputRef.current?.blur();
              changeFontSize();
            }
          }}
        />
      </S.TriggerWrapper>
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
                  onClick={() => {
                    changeFontSize(v);
                    setIsVisible(false);
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
  );
}
