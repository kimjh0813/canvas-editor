import { atom } from "recoil";
export interface ICursor {
  x: number;
  y: number;
  pageIndex: number;
  fontSize: number;
  isFocusCanvas: boolean;
}

export const cursorState = atom<ICursor | undefined>({
  key: "cursorState",
  default: undefined,
});
