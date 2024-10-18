// src/app/services/storage.service.ts

import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  // Save a key-value pair
  async setItem(key: string, value: string): Promise<void> {
    console.log(`Stockage de la clé "${key}" avec la valeur "${value}"`);
    await Preferences.set({ key, value });
  }

  // Retrieve a value by key
  async getItem(key: string): Promise<string | null> {
    const result = await Preferences.get({ key });
    console.log(`Récupération de la clé "${key}" avec la valeur "${result.value}"`);
    return result.value;
  }

  // Remove a specific key
  async removeItem(key: string): Promise<void> {
    console.log(`Suppression de la clé "${key}"`);
    await Preferences.remove({ key });
  }

  // Clear all stored items
  async clear(): Promise<void> {
    console.log("Effacement de toutes les données de stockage");
    await Preferences.clear();
  }
}
