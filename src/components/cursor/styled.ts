import styled, { css, keyframes } from "styled-components";

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const Cursor = styled.div.attrs<{
  $x: number;
  $y: number;
  $fontSize: number;
  $pageIndex: number;
}>((props) => ({
  style: {
    top: `${props.$pageIndex * (1123 + 20) + props.$y + 1}px`,
    left: `${props.$x + 1}px`,
    height: `${props.$fontSize * 1.21}px`,
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
