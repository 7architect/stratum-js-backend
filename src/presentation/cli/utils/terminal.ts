/**
 * Makes text clickable in terminals that support OSC 8 hyperlinks
 * (iTerm2, VS Code terminal, GNOME Terminal, Windows Terminal, etc.)
 *
 * For text that should be selectable/copyable, wraps it in a way that
 * makes it stand out and easy to select.
 *
 * Note: cli-table3 strips ANSI codes by default, so we just return styled text
 */
export function makeClickable(text: string, url?: string): string {
  // Since cli-table3 strips most ANSI codes, we'll just make it cyan/underlined
  // This makes it visually distinct and easy to spot for copying
  return `\x1b[36m\x1b[4m${text}\x1b[0m`
}

/**
 * Makes text bold
 */
export function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`
}

/**
 * Makes text dim/gray
 */
export function dim(text: string): string {
  return `\x1b[2m${text}\x1b[0m`
}

/**
 * Adds color to text
 */
export function color(text: string, colorCode: number): string {
  return `\x1b[${colorCode}m${text}\x1b[0m`
}

/**
 * Gets the current terminal width
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 120
}
