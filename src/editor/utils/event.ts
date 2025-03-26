import { CurrentTextStyle } from "../../components/EditorToolbar/TextStyle";
import { ILineStyle } from "../types/text";

export function dispatchCurrentTextStyleUpdate(
  style: Partial<CurrentTextStyle>
) {
  const event = new CustomEvent("editor:currentTextStyleChange", {
    detail: style,
  });
  window.dispatchEvent(event);
}

export function dispatchCurrentLineStyleUpdate(style: Partial<ILineStyle>) {
  const event = new CustomEvent("editor:currentLineStyleChange", {
    detail: style,
  });
  window.dispatchEvent(event);
}
