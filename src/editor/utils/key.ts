export function isCommandKey(event: KeyboardEvent): boolean {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("mac")) {
    return event.metaKey;
  } else if (userAgent.includes("win") || userAgent.includes("linux")) {
    return event.ctrlKey;
  }

  return false;
}
const koreanChars = new Set([
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
  "ㄲ",
  "ㄸ",
  "ㅃ",
  "ㅆ",
  "ㅉ",
  "ㅏ",
  "ㅣ",
  "ㅓ",
  "ㅜ",
  "ㅡ",
  "ㅕ",
  "ㅗ",
  "ㅛ",
  "ㅠ",
  "ㅑ",
  "ㅐ",
  "ㅒ",
  "ㅖ",
  "ㅔ",
]);

export function isKorean(text: string) {
  if (!text) return false;

  for (let i = 0; i < text.length; i++) {
    if (koreanChars.has(text[i])) {
      return true;
    }
  }

  return false;
}
