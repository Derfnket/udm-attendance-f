// src/app/services/auth.service.ts

import { jwtDecode } from 'jwt-decode';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NativeBiometric } from 'capacitor-native-biometric';
import { StorageService } from './storage.service'; // Importer StorageService

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private storageService: StorageService) {}

  async login(username: string, password: string): Promise<any> {
    console.log("Tentative de connexion avec:", username);
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(async (response: any) => {
        console.log("Réponse de connexion reçue:", response);
        await this.storageService.setItem('authToken', response.access_token);
        await this.storageService.setItem('userId', response.user.id);  // Sauvegarde de l'ID utilisateur
      })
    ).toPromise();
  }

  async logout() {
    console.log("Déconnexion de l'utilisateur");
    await this.storageService.removeItem('authToken');
    await this.storageService.removeItem('userId');
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const expirationDate = new Date(0);
        expirationDate.setUTCSeconds(decodedToken.exp);
        console.log("Date d'expiration du token:", expirationDate);
        return expirationDate > new Date();
      } catch (error) {
        console.error('Erreur lors de la vérification du token JWT', error);
        return false;
      }
    }
    return false;
  }

  // Méthode pour récupérer le token JWT stocké
  async getToken(): Promise<string> {
    const token = await this.storageService.getItem('authToken');
    console.log("Token récupéré:", token);
    return token || '';
  }

  // Méthode pour récupérer l'ID utilisateur à partir du token JWT
  async getUserId(): Promise<string> {
    const token = await this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("UserID extrait du token:", decodedToken.userId || decodedToken.sub);
        return decodedToken.userId || decodedToken.sub || '';
      } catch (error) {
        console.error('Erreur lors du décodage du token JWT', error);
        return '';
      }
    }
    return '';
  }

  // Méthode pour récupérer l'historique de l'utilisateur
  async getUserHistory(userId: string): Promise<Observable<any>> {
    const token = await this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/auth/user-history/${userId}`, { headers });
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  // Méthode pour vérifier l'identité biométrique
  async verifyBiometric(reason: string): Promise<string | null> {
    try {
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Authentification Biométrique',
        subtitle: 'Vérification',
        description: 'Authentifiez-vous pour continuer',
        useFallback: true,
        maxAttempts: 3,
      });

      return 'biometric_token'; // Remplacez par un vrai token si nécessaire
    } catch (error) {
      console.error('Erreur de vérification biométrique:', error);
      return null; 
    }
  }

  // Méthode pour enregistrer l'arrivée
  async recordArrival(qrData: string, latitude: number, longitude: number, biometricToken: string): Promise<Observable<any>> {
    const payload = {
      qrData,
      location: { lat: latitude, lon: longitude },
      actionType: 'arrival',
      biometricToken,
    };

    const token = await this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/presence`, payload, { headers });
  }

  // Méthode pour enregistrer le départ
  async recordDeparture(qrData: string, latitude: number, longitude: number, biometricToken: string): Promise<Observable<any>> {
    const payload = {
      qrData,
      location: { lat: latitude, lon: longitude },
      actionType: 'departure',
      biometricToken,
    };

    const token = await this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/presence`, payload, { headers });
  }

  async getUserProfile() {
    const token = await this.storageService.getItem('authToken');
    const userId = await this.storageService.getItem('userId'); 
  
    if (!token || !userId) {
      console.error("Erreur: Aucun token d'authentification ou ID utilisateur trouvé.");
      throw new Error('No auth token or user ID found');
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/admin/users/profile/${userId}`, {
      headers,
      responseType: 'json'  // Force la réponse à être traitée comme JSON
    });
  }
  

  

  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/update-profile/me`, data);
  }

  updateProfileImage(imageData: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/update-profile-image`, { image: imageData });
  }
}
