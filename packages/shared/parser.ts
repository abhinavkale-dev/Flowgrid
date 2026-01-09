export function parseTemplate(
  template: string,
  values: Record<string, any>,
  startDelimiter = '{',
  endDelimiter = '}'
): string {
  if (typeof template !== 'string') {
    return String(template)
  }

  let result = ''
  let i = 0

  while (i < template.length) {
    if (template[i] === startDelimiter) {
      let j = i + 1
      while (j < template.length && template[j] !== endDelimiter) {
        j++
      }

      if (j < template.length) {

        const key = template.slice(i + 1, j)

        const keys = key.split('.')
        let value: any = values

        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k]
          } else {
            value = undefined
            break
          }
        }

        result += value !== undefined && value !== null ? String(value) : ''

        i = j + 1
      } else {
        result += template[i]
        i++
      }
    } else {
      result += template[i]
      i++
    }
  }

  return result
}





