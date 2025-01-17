import styled, { css, keyframes } from "styled-components";

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const Cursor = styled.div<{
  $x: number;
  $y: number;
  $fontSize: number;
  $isBlinking: boolean;
}>`
  position: absolute;
  top: ${({ $y }) => `${$y + 1}px`};
  left: ${({ $x }) => `${$x + 1}px`};
  width: 2px;
  background-color: black;
  height: ${({ $fontSize }) => `${$fontSize * 1.21}px`};

  ${({ $isBlinking }) =>
    $isBlinking &&
    css`
      animation: ${blink} 1s steps(1, end) infinite;
    `}
`;
