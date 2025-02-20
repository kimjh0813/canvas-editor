import { createContext, useContext } from "react";
import { EditorManger } from "../editor/core/EditorManger";

interface EditorContextType {
  editorManger: EditorManger;
  draw: (shouldUpdateText: boolean) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
