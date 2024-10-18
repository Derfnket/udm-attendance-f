// src/app/services/presence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service'; // Importer StorageService

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private apiUrl = `${environment.apiUrl}/presence`;

  constructor(private http: HttpClient, private storageService: StorageService) {}

  // Méthode pour récupérer l'historique de présence de l'utilisateur
  async getPresenceHistory(): Promise<Observable<any>> {
    const token = await this.storageService.getItem('authToken');
    console.log("Token pour l'historique de présence récupéré:", token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/history`, { headers });
  }
}
