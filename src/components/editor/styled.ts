import styled from "styled-components";

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const CanvasContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

export const CanvasWrapper = styled.div<{ $canvasHeight: number }>`
  outline: 1px solid #c7c7c7;
  height: ${({ $canvasHeight }) => `${$canvasHeight}`}px;

  canvas {
    cursor: text;
    outline: none;
    background-color: white;
  }
`;
