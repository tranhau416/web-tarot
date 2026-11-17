import AsyncStorage from "@react-native-async-storage/async-storage"

/** AsyncStorage with errors swallowed: a failed read is "nothing saved", a failed write is skipped. */
export async function readItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key)
  } catch {
    return null
  }
}

export async function writeItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value)
  } catch {
    // storage unavailable — keep going without persisting
  }
}
