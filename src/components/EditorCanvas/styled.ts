import styled from "styled-components";

export const CanvasWrapper = styled.div<{ $canvasHeight: number }>`
  outline: 1px solid #c7c7c7;
  height: ${({ $canvasHeight }) => `${$canvasHeight}`}px;

  canvas {
    cursor: text;
    outline: none;
    background-color: white;
  }
`;
