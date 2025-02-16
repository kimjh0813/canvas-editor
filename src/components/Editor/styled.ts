import styled from "styled-components";

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`;

export const CanvasScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding-top: 20px;
`;

export const CanvasContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
