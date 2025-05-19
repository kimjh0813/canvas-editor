import { IconWrapper } from "../styled";
import { useEditor } from "../../../context/EditorContext";
import { TLineAlign } from "../../../editor/types/text";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { MouseEvent } from "react";

interface ItalicProps {
  align?: TLineAlign;
}

export function Align({ align }: ItalicProps) {
  const { editorManger } = useEditor();

  const handleClick = (e: MouseEvent, align: TLineAlign) => {
    e.stopPropagation();

    editorManger.lineStyle.updateLineStyle({ align });
  };

  return (
    <>
      <IconWrapper
        $isActive={align === "left"}
        onClick={(e) => {
          handleClick(e, "left");
        }}
      >
        <AlignLeft width={16} height={16} strokeWidth={2} />
      </IconWrapper>
      <IconWrapper
        $isActive={align === "center"}
        onClick={(e) => {
          handleClick(e, "center");
        }}
      >
        <AlignCenter width={16} height={16} strokeWidth={2} />
      </IconWrapper>
      <IconWrapper
        $isActive={align === "right"}
        onClick={(e) => {
          handleClick(e, "right");
        }}
      >
        <AlignRight width={16} height={16} strokeWidth={2} />
      </IconWrapper>
    </>
  );
}
