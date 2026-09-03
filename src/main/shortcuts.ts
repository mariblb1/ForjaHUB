import type { Input } from 'electron'

export type OperatorShortcut = 'quit' | 'toggle-fullscreen' | 'open-operator'

type ChordInput = Pick<
  Input,
  'type' | 'shift' | 'control' | 'meta' | 'alt' | 'isAutoRepeat' | 'key'
>

export function matchOperatorShortcut(input: ChordInput): OperatorShortcut | null {
  if (input.type !== 'keyDown' || input.isAutoRepeat) return null
  if (!input.shift || input.alt) return null
  if (!(input.control || input.meta)) return null
  switch (input.key.toLowerCase()) {
    case 'q':
      return 'quit'
    case 'm':
      return 'toggle-fullscreen'
    case 'o':
      return 'open-operator'
    default:
      return null
  }
}
