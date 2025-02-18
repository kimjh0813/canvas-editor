import styled from "styled-components";

export const RelativeContainer = styled.div`
  position: relative;
`;

export const TriggerWrapper = styled.div``;

export const FontSizeInput = styled.input`
  width: 28px;
  height: 18px;
  text-align: center;
  background-color: transparent;
  border: 1px solid #222;
  border-radius: 3px;
`;

export const FontSizeListWrapper = styled.div`
  display: flex;
  flex-direction: column;

  .font-size-item {
    width: 100%;
    font-size: 14px;
    cursor: pointer;
    padding: 6px 0;
    text-align: center;
  }

  .font-size-item:hover {
    background-color: #eff1f2;
  }
`;
