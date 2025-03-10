export function getPageInfoFromY(
  layerY: number,
  canvasHeight: number,
  pageSize: number
) {
  const gap = 20;

  let pageIndex = null;
  let cumulativeHeight = 0;

  for (let i = 0; i < pageSize; i++) {
    if (
      layerY >= cumulativeHeight &&
      layerY <= cumulativeHeight + canvasHeight
    ) {
      pageIndex = i;
      break;
    }

    cumulativeHeight += canvasHeight + gap;
  }

  if (pageIndex === null) return null;

  return { pageIndex, y: layerY - cumulativeHeight };
}
