// src/app/services/auth.service.ts

import { jwtDecode } from 'jwt-decode';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NativeBiometric } from 'capacitor-native-biometric';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('authToken', response.access_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    // Supprimer également les identifiants biométriques si nécessaire
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const expirationDate = new Date(0);
        expirationDate.setUTCSeconds(decodedToken.exp);
        return expirationDate > new Date();
      } catch (error) {
        console.error('Erreur lors de la vérification du token JWT', error);
        return false;
      }
    }
    return false;
  }

  // Méthode pour récupérer le token JWT stocké dans localStorage
  getToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  // Méthode pour récupérer l'ID utilisateur à partir du token JWT
  getUserId(): string {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.userId || decodedToken.sub || '';
      } catch (error) {
        console.error('Erreur lors du décodage du token JWT', error);
        return '';
      }
    }
    return '';
  }

  // Méthode pour récupérer l'historique de l'utilisateur
  getUserHistory(userId: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
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
      // Si l'appel réussit, la promesse est résolue
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Authentification Biométrique',
        subtitle: 'Vérification',
        description: 'Authentifiez-vous pour continuer',
        useFallback: true,
        maxAttempts: 3,
      });

      // La vérification est réussie, retourner un token biométrique simulé
      return 'biometric_token'; // Remplacez par un vrai token si nécessaire
    } catch (error) {
      console.error('Erreur de vérification biométrique:', error);
      return null; // Retourner null si la vérification échoue
    }
  }

  // Méthode pour enregistrer l'arrivée
  recordArrival(qrData: string, latitude: number, longitude: number, biometricToken: string): Observable<any> {
    const payload = {
      qrData,
      location: { lat: latitude, lon: longitude },
      actionType: 'arrival',
      biometricToken, // Token biométrique pour la vérification
    };
    return this.http.post(`${this.apiUrl}/presence`, payload);
  }

  // Méthode pour enregistrer le départ
  recordDeparture(qrData: string, latitude: number, longitude: number, biometricToken: string): Observable<any> {
    const payload = {
      qrData,
      location: { lat: latitude, lon: longitude },
      actionType: 'departure',
      biometricToken, // Token biométrique pour la vérification
    };
    return this.http.post(`${this.apiUrl}/presence`, payload);
  }


  getUserProfile() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // Récupérer l'ID utilisateur
  
    if (!token || !userId) {
      throw new Error('No auth token or user ID found');
    }
  
    return this.http.get(`${this.apiUrl}/admin/users/profile/${userId}`, { // Utiliser l'ID utilisateur ici
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  
  

  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/update-profile/me`, data);
  }

  updateProfileImage(imageData: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/update-profile-image`, { image: imageData });
  }
}
