import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_ID_KEY = 'anonymous_user_id';

/**
 * Get the anonymous id from SecureStore, or generate and store a new one if not present.
 */
export async function getOrCreateAnonymousId(): Promise<string> {
  let id = await SecureStore.getItemAsync(ANONYMOUS_ID_KEY);
  if (!id) {
    id = uuidv4();
    await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

/**
 * Directly set the anonymous id.
 */
export async function updateAnonymousId(id: string): Promise<void> {
  await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
}

/**
 * Clear the anonymous id from SecureStore
 */
export async function clearAnonymousId(): Promise<void> {
  await SecureStore.deleteItemAsync(ANONYMOUS_ID_KEY);
}
