import { deserializeAppData } from '@/infrastructure/serialization/AppDataSerializer'
import type { AppData } from '@/infrastructure/serialization/AppDataSerializer'

export function readJsonFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        resolve(deserializeAppData(text))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}
