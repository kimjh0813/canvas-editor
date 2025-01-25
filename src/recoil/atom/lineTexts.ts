import { atom } from "recoil";

export interface Cursor {
  x: number;
  y: number;
  fontSize: number;
}

export const lineTextsState = atom<Cursor | undefined>({
  key: "lineTextsState",
  default: undefined,
});
