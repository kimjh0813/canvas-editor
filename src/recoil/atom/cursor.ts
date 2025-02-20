import { atom } from "recoil";
export interface ICursor {
  x: number;
  y: number;
  index: number;
  pageIndex: number;
  fontSize: number;
  lineMaxFontSize: number;
  isFocusCanvas: boolean;
}

export const cursorState = atom<ICursor | undefined>({
  key: "cursorState",
  default: undefined,
});
