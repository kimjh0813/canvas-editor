import { fontFamilyList } from "../../constants/toolbar";
import { ITextFragment, ITextStyle } from "../types/text";

export function getFontStyle(textFragment: ITextFragment) {
  const { fontSize, fontFamily, bold, italic } = textFragment;

  const fontWeight = bold ? "700" : "400";

  const italicStyle = italic ? "italic" : "normal";

  return `${italicStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

export function convertTextToHTML(textFragments: ITextFragment[]): string {
  let html = "";
  let currentParagraph: string[] = [];
  let currentSpan = "";
  let lastStyle = "";

  textFragments.forEach((fragment, index) => {
    const {
      text,
      fontSize,
      fontFamily,
      color,
      backgroundColor,
      bold,
      italic,
      underline,
    } = fragment;

    const style =
      `font-size:${fontSize}px;font-family:${fontFamily}, sans-serif;color:${color};background-color:${
        backgroundColor || "transparent"
      };font-weight:${bold ? "700" : "400"};font-style:${
        italic ? "italic" : "normal"
      };text-decoration:${underline ? "underline" : "none"};`.trim();

    if (text === "\n") {
      if (currentSpan) currentParagraph.push(currentSpan + "</span>");
      html += `<p style="margin-top:0pt;margin-bottom:0pt;">${currentParagraph.join(
        ""
      )}</p>`;

      currentParagraph = [];
      currentSpan = "";
      lastStyle = "";
    } else {
      if (!lastStyle || lastStyle !== style) {
        if (currentSpan) currentParagraph.push(currentSpan + "</span>");
        currentSpan = `<span style="${style}">${text}`;
        lastStyle = style;
      } else {
        currentSpan += text;
      }
    }

    // last text close <p> tag
    if (index === textFragments.length - 1) {
      if (currentSpan) currentParagraph.push(currentSpan + "</span>");
      html += `<p style="margin-top:0pt;margin-bottom:0pt;">${currentParagraph.join(
        ""
      )}</p>`;
    }
  });

  return html;
}

export function convertHTMLToText(
  html: string,
  defaultStyle: Omit<ITextFragment, "text">
): ITextFragment[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const fragments: ITextFragment[] = [];

  function parseNode(node: Node, currentStyle: Omit<ITextFragment, "text">) {
    const newStyle =
      node.nodeType === Node.ELEMENT_NODE
        ? extractStyle(node as HTMLElement, currentStyle)
        : currentStyle;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\u00A0/g, " ") || "";
      for (const char of text) {
        fragments.push({ text: char, ...newStyle });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as HTMLElement;

    if (element.tagName === "P" && fragments.length > 0) {
      const style = getLastTextStyle(fragments, defaultStyle);
      fragments.push({ text: "\n", ...style });
    }

    if (element.tagName === "BR") {
      const style = getLastTextStyle(fragments, defaultStyle);
      fragments.push({ text: "\n", ...style });

      return;
    }

    for (const child of Array.from(element.childNodes)) {
      parseNode(child, newStyle);
    }
  }

  const body = doc.body;

  for (const node of Array.from(body.childNodes)) {
    parseNode(node, defaultStyle);
  }

  return fragments;
}

const getLastTextStyle = (
  fragments: ITextFragment[],
  defaultStyle: Omit<ITextFragment, "text">
): Omit<ITextFragment, "text"> => {
  const lastText = [...fragments].reverse().find((f) => f.text !== "\n");

  return lastText
    ? {
        align: "left",
        fontSize: lastText.fontSize,
        fontFamily: lastText.fontFamily,
        color: lastText.color,
        backgroundColor: lastText.backgroundColor,
        bold: lastText.bold,
        italic: lastText.italic,
        underline: lastText.underline,
      }
    : defaultStyle;
};

function extractStyle(
  element: HTMLElement,
  baseStyle: Omit<ITextFragment, "text">
): Omit<ITextFragment, "text"> {
  return {
    align: "left",
    fontSize: element.style.fontSize
      ? parseFloat(element.style.fontSize)
      : baseStyle.fontSize,
    fontFamily: element.style.fontFamily
      ? getValidFontFamily(
          element.style.fontFamily.split(",")[0].replace(/['"]/g, "")
        )
      : baseStyle.fontFamily,
    color: element.style.color || baseStyle.color,
    backgroundColor:
      element.style.backgroundColor &&
      element.style.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? element.style.backgroundColor
        : baseStyle.backgroundColor,
    bold:
      element.style.fontWeight === "bold" ||
      parseInt(element.style.fontWeight) >= 600 ||
      baseStyle.bold,
    italic: element.style.fontStyle === "italic" || baseStyle.italic,
    underline:
      element.style.textDecoration.includes("underline") || baseStyle.underline,
  };
}

function getValidFontFamily(fontFamily: string): string {
  return fontFamilyList.includes(fontFamily) ? fontFamily : fontFamilyList[0];
}
