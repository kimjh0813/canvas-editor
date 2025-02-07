export interface TextFragment {
  text: string;
  fontSize: number;
}

export interface LineText {
  endIndex: number;
  maxFontSize: number;
  text: TextFragment[];
  x: number;
  y: number;
}
