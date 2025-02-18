export interface ITextFragment {
  text: string;
  fontSize: number;
}

export interface ILineText {
  endIndex: number;
  maxFontSize: number;
  text: ITextFragment[];
  x: number;
  y: number;
}
