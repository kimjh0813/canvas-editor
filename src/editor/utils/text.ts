import { ITextFragment } from "../types/text";

export function getFontStyle(textFragment: ITextFragment) {
  const { fontSize, fontFamily, bold, italic } = textFragment;

  const fontWeight = bold ? "700" : "500";

  const italicStyle = italic ? "italic" : "normal";

  return `${italicStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
}
