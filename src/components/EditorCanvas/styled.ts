import styled from "styled-components";

export const EditorCanvasWrapper = styled.div``;

export const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

export const CanvasWrapper = styled.div<{
  $canvasWidth: number;
  $canvasHeight: number;
}>`
  outline: 1px solid #c7c7c7;
  width: ${({ $canvasWidth }) => `${$canvasWidth}`}px;
  height: ${({ $canvasHeight }) => `${$canvasHeight}`}px;

  canvas {
    cursor: text;
    outline: none;
    background-color: white;
  }
`;
