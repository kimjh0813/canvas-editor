export interface TextFragment {
  text: string;
  fontSize: number;
  isSelect: boolean;
}

export interface LineText {
  endIndex: number;
  maxFontSize: number;
  text: TextFragment[];
  x: number;
  y: number;
}
