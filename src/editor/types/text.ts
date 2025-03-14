export interface ITextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  fontFamily: string;
}

export type ITextFragment = {
  text: string;
} & ITextStyle;

export interface ILineText {
  endIndex: number;
  maxFontSize: number;
  text: ITextFragment[];
  x: number;
  y: number;
}
