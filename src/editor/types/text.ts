export interface ITextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  fontFamily: string;
}

export interface ILineStyle {
  align: "left" | "center" | "right";
}

export type ITextFragment = {
  text: string;
} & ITextStyle &
  ILineStyle;

export interface ILineText {
  endIndex: number;
  maxFontSize: number;
  text: ITextFragment[];
  x: number;
  y: number;
}
