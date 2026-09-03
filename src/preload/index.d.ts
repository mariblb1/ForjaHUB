import type { ForjaAPI } from '@shared/forja-api'

declare global {
  interface Window {
    forjaAPI: ForjaAPI
  }
}
