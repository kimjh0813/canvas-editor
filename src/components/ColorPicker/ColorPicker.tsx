import { Check } from "lucide-react";
import { needBorderColors, pickColors } from "../../constants/toolbar";
import * as S from "./styled";
import { shouldUseWhiteCheck } from "../../utils/color";

interface ColorPickerProps {
  selectColor?: string;
  handleClick: (color: string) => void;
}

export function ColorPicker({ selectColor, handleClick }: ColorPickerProps) {
  return (
    <S.Container>
      {pickColors.map((colors, i) => {
        return (
          <S.ColorListWrapper key={i}>
            {colors.map((color) => {
              return (
                <S.Color
                  key={color}
                  $color={color}
                  $isNeedBorder={needBorderColors.includes(color)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(color);
                  }}
                >
                  {selectColor === color && (
                    <Check
                      width={16}
                      height={16}
                      color={shouldUseWhiteCheck(color) ? "white" : "black"}
                    />
                  )}
                </S.Color>
              );
            })}
          </S.ColorListWrapper>
        );
      })}
    </S.Container>
  );
}
