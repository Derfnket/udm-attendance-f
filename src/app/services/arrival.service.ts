// src/app/services/arrival.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArrivalService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  startScan() {
    // Implémenter la logique de scan QR ici
    return this.http.get(`${this.apiUrl}/start-scan`);
  }

  validateArrival(qrCodeData: string) {
    return this.http.post(`${this.apiUrl}/arrival`, { qrCodeData });
  }
}
