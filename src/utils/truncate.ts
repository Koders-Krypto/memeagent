export function Truncate(str = "", maxLength = 5, truncateWith = "...") {
  if (str.length <= maxLength) {
    return str; // No truncation needed
  }

  const charsToShow = maxLength - truncateWith.length;
  if (charsToShow <= 0) {
    return truncateWith; // If the maxLength is too small
  }

  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return str.slice(0, frontChars) + truncateWith + str.slice(-backChars);
}
