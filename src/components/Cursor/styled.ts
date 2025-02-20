import styled, { css, keyframes } from "styled-components";

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

// const underlineY = lineText.y + textHeight * 1.2;
export const Cursor = styled.div.attrs<{
  $x: number;
  $y: number;
  $fontSize: number;
  $pageIndex: number;
  $lineMaxFontSize: number;
}>(({ $pageIndex, $fontSize, $lineMaxFontSize, $x, $y }) => ({
  style: {
    top: `${
      $pageIndex * (1123 + 20) +
      $y +
      $lineMaxFontSize -
      $fontSize +
      $fontSize * 0.1
    }px`,
    left: `${$x}px`,
    height: `${$fontSize}px`,
  },
}))<{
  $isBlinking: boolean;
}>`
  position: absolute;
  width: 2px;
  background-color: black;

  ${({ $isBlinking }) =>
    $isBlinking &&
    css`
      animation: ${blink} 1s steps(1, end) infinite;
    `}
`;
