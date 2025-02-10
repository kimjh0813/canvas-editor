import { selector } from "recoil";
import { cursorState } from "../atom";

const isCursorSelector = selector({
  key: "isCursorSelector",
  get: ({ get }) => {
    const cursor = get(cursorState);

    return cursor !== undefined;
  },
});

export { isCursorSelector };
