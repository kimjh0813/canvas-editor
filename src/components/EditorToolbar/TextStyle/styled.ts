import styled from "styled-components";

export const RelativeContainer = styled.div`
  position: relative;
`;

export const ColorContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const SizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const SizeInput = styled.input`
  width: 28px;
  height: 19px;
  text-align: center;
  background-color: transparent;
  border: 1px solid #222;
  border-radius: 3px;
`;

export const SizeListWrapper = styled.div`
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

export const RemoveBgColorButton = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  cursor: pointer;
  gap: 8px;
  margin-bottom: 3px;

  &:hover {
    background-color: #eff1f2;
  }
`;

export const FamilyTriggerWrapper = styled.div`
  display: flex;
  width: 90px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  padding: 6px 10px;
  align-items: center;
  gap: 2px;

  &:hover {
    background-color: #e0e4ea;
  }

  .family-text {
    flex: 1;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const FamilyListWrapper = styled.div`
  padding: 6px 1px;
  font-size: 14px;

  .family-item {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 18px;
    padding: 6px 12px;
    cursor: pointer;

    .icon-wrapper {
      display: flex;
      align-items: center;
      min-width: 16px;
    }

    &:hover {
      background-color: #eff1f2;
    }
  }
`;
