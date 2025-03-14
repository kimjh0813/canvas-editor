import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 12px;
`;

export const ColorListWrapper = styled.div`
  display: flex;
  gap: 2px;
`;

export const Color = styled.div<{ $color: string; $isNeedBorder: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $color }) => $color};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s ease-in-out;

  ${({ $isNeedBorder }) =>
    $isNeedBorder && `border: 1px solid #D5D7DB; box-sizing: border-box;`}

  &:hover {
    box-shadow: 0 2px 4px rgba(100, 100, 100, 0.5);
  }
`;
