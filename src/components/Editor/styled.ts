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
  justify-content: center;
  overflow-y: auto;
  padding-top: 30px;
`;

export const CanvasContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 20px;
`;
