import { csvToForjaHubData } from './csvParser'
import type { ForjaHubData } from '../types/game'

export function buildSheetCsvUrl(sheetId: string, gid = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}

export async function fetchFromGooogleSheets(sheetId: string, gid = '0'): Promise<ForjaHubData> {
  const url = buildSheetCsvUrl(sheetId, gid)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha ao buscar planilha (HTTP ${response.status}): ${response.statusText}`)
  }

  const csvText = await response.text()
  return csvToForjaHubData(csvText)
}

export async function fetchFromLocal(csvPath: string): Promise<ForjaHubData> {
  const response = await fetch(csvPath)

  if (!response.ok) {
    throw new Error(`Falha carregar o arquivo local ${csvPath}`)
  }
  const csvText = await response.text()
  return csvToForjaHubData(csvText)
}

export const FORJA_SHEET_ID = '13TCdp4u58u3FiOe0tD_PVIRBKYwjEpyrGRSY8aFt2tM' //lembrar de sustituir
