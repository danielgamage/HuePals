// separate `value` into `parts`, where `parts` is an array of objects, labeled `significant` or `insignificant`
export const separateNumericStringIntoParts = (el: string) => {
  const parts = []
  let current = ""
  for (let i = 0; i < el.length; i++) {
    const char = el[i]
    const isStillInsignificant = [".", "0"].includes(char) && i < el.length - 1
    if (isStillInsignificant) {
      current += char
    } else {
      current.length && parts.push({ value: current, type: "insignificant" })
      parts.push({
        value: el.slice(i, el.length),
        type: "significant",
      })
      break;
    }
  }
  return parts
}