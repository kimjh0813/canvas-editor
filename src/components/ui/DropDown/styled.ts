import styled from "styled-components";

export const RelativeContainer = styled.div`
  position: relative;
`;

export const TriggerWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const Container = styled.div<{ $position: "right" | "left" }>`
  position: absolute;
  width: 100%;
  z-index: 999;
  background-color: white;
  box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 2px;

  ${({ $position }) => $position === "right" && "right: 0"}
`;
