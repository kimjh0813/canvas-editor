import { Editor } from "./components";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Editor />
    </div>
  );
}

export default App;
