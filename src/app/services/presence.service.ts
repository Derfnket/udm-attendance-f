// src/app/services/presence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private apiUrl = `${environment.apiUrl}/presence`;

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer l'historique de présence de l'utilisateur
  getPresenceHistory(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    return this.http.get(`${this.apiUrl}/history`, { headers });
  }
}
