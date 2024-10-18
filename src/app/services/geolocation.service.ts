// src/app/services/geolocation.service.ts
import { Injectable } from '@angular/core';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
@Injectable({
  providedIn: 'root',
})
export class GeolocationService {

  constructor() { }

  async requestLocationPermission() {
    const permission = await Geolocation.requestPermissions();
    if (permission.location !== 'granted') {
      throw new Error('Permission de géolocalisation non accordée.');
    }
  }

 // Demande et obtient la localisation GPS
 async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Demande les permissions de géolocalisation
    await Geolocation.requestPermissions();

    // Obtient la localisation actuelle
    const position = await Geolocation.getCurrentPosition();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error('Erreur de géolocalisation:', error);
    return null;
  }
}
}
