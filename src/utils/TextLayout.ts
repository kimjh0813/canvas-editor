class TextLayout {
  private lineTexts: LineText[] = [];
  private lineText: TextFragment[] = [];
  private maxFontSize: number;
  private x: number;
  private y: number;
  private lineNumber: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvasWidth: number,
    private marginX: number,
    private marginY: number,
    private defaultFontSize: number,
    private setCursor: (cursor: {
      x: number;
      y: number;
      fontSize: number;
    }) => void
  ) {
    this.maxFontSize = defaultFontSize;
    this.x = marginX;
    this.y = marginY;
  }

  private calculateTextWidth(text: string, fontSize: number): number {
    this.ctx.font = `500 ${fontSize}px Arial`;
    return this.ctx.measureText(text).width;
  }

  private saveLine(endIndex: number) {
    this.lineTexts.push({
      endIndex,
      maxFontSize: this.maxFontSize,
      text: this.lineText,
      x: this.marginX,
      y: this.y,
    });

    this.lineNumber++;
    this.y += this.maxFontSize * 1.48;
    this.x = this.marginX;
    this.lineText = [];
    this.maxFontSize = this.defaultFontSize;
  }

  public layout(textArr: TextFragment[]): LineText[] {
    for (let i = 0; i < textArr.length; i++) {
      const { text, fontSize } = textArr[i];
      this.maxFontSize = Math.max(this.maxFontSize, fontSize);

      const textWidth = this.calculateTextWidth(text, fontSize);
      const currentWidth = this.x + this.marginX + textWidth;
      const isLastText = i === textArr.length - 1;

      if (currentWidth > this.canvasWidth && text !== "\n") {
        this.saveLine(i - 1);
      }

      this.lineText.push(textArr[i]);
      this.x += textWidth;

      if (text === "\n") {
        this.saveLine(i);
      }

      if (isLastText) {
        this.saveLine(i);
        this.setCursor({ x: this.x, y: this.y, fontSize });
      }
    }

    return this.lineTexts;
  }
}

// 사용 예시
const textLayout = new TextLayout(
  ctx,
  800,
  20,
  20,
  16,
  ({ x, y, fontSize }) => {
    console.log(`Cursor positioned at (${x}, ${y}) with fontSize ${fontSize}`);
  }
);
const lineTexts = textLayout.layout(textArr);
