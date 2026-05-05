const DEFAULT_CHARS = ' \xA0';

function trim(str: string, chars: string = DEFAULT_CHARS): string {
  const set = new Set(chars);

  let start = 0;
  let end = str.length - 1;

  // find the left "non-space" char
  while (start <= end && set.has(str[start])) {
    start++;
  }
  // and the rigth one
  while (end >= start && set.has(str[end])) {
    end--;
  }

  return str.slice(start, end + 1);
}

export default trim;
