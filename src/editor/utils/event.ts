import { CursorStyle } from "../../components/EditorToolbar/FontStyle";

export function dispatchCursorStyleUpdate(style: Partial<CursorStyle>) {
  const event = new CustomEvent("editor:cursorStyleChange", {
    detail: style,
  });
  window.dispatchEvent(event);
}
