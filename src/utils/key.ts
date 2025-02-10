export function isCommandKey(event: KeyboardEvent): boolean {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("mac")) {
    return event.metaKey;
  } else if (userAgent.includes("win") || userAgent.includes("linux")) {
    return event.ctrlKey;
  }

  return false;
}
