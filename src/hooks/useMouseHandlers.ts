import { useCallback } from "react";
import { EditorManger } from "../editor/core/EditorManger";
import { throttle } from "lodash";

export function useMouseHandlers(editorManger: EditorManger) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, index: number) => {
      switch (e.button) {
        case 0:
          editorManger.canvasMouse.down(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
            index
          );
          break;
        case 2:
          console.log("right button");
          break;
        default:
          console.log("else button");
      }
    },
    [editorManger]
  );

  const handleMouseMove = useCallback(
    throttle(
      (e: MouseEvent) => {
        editorManger.canvasMouse.move(e);
      },
      30,
      { trailing: true }
    ),
    [editorManger]
  );

  const handleMouseUp = useCallback(() => {
    editorManger.canvasMouse.up();
  }, [editorManger]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
