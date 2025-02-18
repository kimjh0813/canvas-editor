import {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

import * as S from "./styled";

interface DropDownProps {
  triggerElement: React.ReactNode;
  usePropagation?: boolean;
  style?: React.CSSProperties;
  position?: "left" | "right";
}

export function DropDown({
  children,
  triggerElement,
  position = "left",
  style,
  usePropagation,
}: PropsWithChildren<DropDownProps>) {
  const triggerRef = useRef<HTMLDivElement>(null);

  const [animate] = useAutoAnimate({ duration: 80, easing: "linear" });

  const [isVisible, setIsVisible] = useState<boolean>();

  return (
    <S.RelativeContainer>
      <S.TriggerWrapper
        ref={triggerRef}
        onClick={() => setIsVisible((prev) => !prev)}
      >
        {triggerElement}
      </S.TriggerWrapper>
      <div ref={animate}>
        {isVisible && (
          <DropDownContent
            triggerRef={triggerRef}
            onClickOutside={() => {
              setIsVisible(false);
            }}
            position={position}
            style={style}
            usePropagation={usePropagation}
          >
            {children}
          </DropDownContent>
        )}
      </div>
    </S.RelativeContainer>
  );
}

interface DropDownContentProps {
  triggerRef: MutableRefObject<HTMLElement | null>; //trigger 요소 ref 값
  onClickOutside: () => void;
  usePropagation?: boolean;
  style?: React.CSSProperties;
  position?: "left" | "right";
}

export function DropDownContent({
  children,
  triggerRef,
  style,
  onClickOutside,
  usePropagation,
  position = "left",
}: PropsWithChildren<DropDownContentProps>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // trigger 요소 클릭 시 리턴

      if (
        triggerRef.current &&
        triggerRef.current.contains(e.target as Element)
      )
        return;

      if (ref.current && !ref.current.contains(e.target as Element)) {
        usePropagation && e.stopPropagation();
        onClickOutside();
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("contextmenu", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("contextmenu", handleClickOutside, true);
    };
  }, []);

  return (
    <S.Container
      className="dropdown-wrapper"
      ref={ref}
      $position={position}
      style={style}
    >
      {children}
    </S.Container>
  );
}
