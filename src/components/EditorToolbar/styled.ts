import styled from "styled-components";

export const EditorToolbarContainer = styled.div`
  width: calc(100% - 32px);
  padding: 20px 10px;
  border-bottom: 1px solid #bcc0be;
  user-select: none;
`;

export const EditorControlWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  background-color: #eef2f8;
  border-radius: 24px;
`;

export const VerticalDivider = styled.div`
  width: 1px;
  height: 20px;
  background-color: #c0c0c0;
  margin: 0px 3px;
`;

export const IconWrapper = styled.div<{ $isActive?: boolean; $size?: number }>`
  cursor: pointer;
  ${({ $size }) =>
    $size
      ? `
    width: ${$size}px;
    height: ${$size}px;`
      : `
    width: 30px;
    height: 30px;`}

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  margin: 0 1px;

  ${({ $isActive }) =>
    $isActive
      ? `
    background-color: #CDE0FB;
  `
      : `
    &:hover {
      background-color: #e0e4ea;
    }
  `}
`;
