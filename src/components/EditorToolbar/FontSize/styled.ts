import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const IconWrapper = styled.div`
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;

  &:hover {
    background-color: #e0e4ea;
  }
`;

export const RelativeContainer = styled.div`
  position: relative;
`;

export const FontSizeInput = styled.input`
  width: 28px;
  height: 19px;
  text-align: center;
  background-color: transparent;
  border: 1px solid #222;
  border-radius: 3px;
`;

export const FontSizeListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;

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
