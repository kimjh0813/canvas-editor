import { KeyboardEvent } from "react";

export type EditorKeyEvent = KeyboardEvent<HTMLInputElement>;

export interface ITextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  fontFamily: string;
}

export type TTextStyleKey =
  | "bold"
  | "italic"
  | "underline"
  | "fontSize"
  | "color"
  | "backgroundColor"
  | "fontFamily";

export interface ILineStyle {
  align: TLineAlign;
}

export type TLineAlign = "left" | "center" | "right";

export type TLineStyleKey = "align";

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
