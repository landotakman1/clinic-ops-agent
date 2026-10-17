// "in_progress" -> "In progress"
export function formatLabel(value: string): string {
  const spaced = value.replaceAll('_', ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
