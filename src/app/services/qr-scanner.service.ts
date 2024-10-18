// src/app/services/qr-scanner.service.ts

import { Injectable } from '@angular/core';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerOptions, CapacitorBarcodeScannerScanResult, CapacitorBarcodeScannerTypeHint, CapacitorBarcodeScannerScanOrientation } from '@capacitor/barcode-scanner';

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {

  constructor() { }

  /**
   * Démarre le scan du QR code.
   * @returns Le contenu du QR code scanné ou null si aucun contenu n'est trouvé.
   */
  async startScan(): Promise<string | null> {
    try {
      // Définir les options pour le scan
      const options: CapacitorBarcodeScannerOptions = {
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,  // Utilisez une valeur correcte de l'énumération
        scanOrientation: CapacitorBarcodeScannerScanOrientation.PORTRAIT,  // Valeur correcte
        // Ajoutez d'autres options si nécessaire
      };

      // Ajouter une classe CSS pour indiquer que le scanner est actif
      document.body.classList.add('scanner-active');

      // Lancer le scan
      const result: CapacitorBarcodeScannerScanResult = await CapacitorBarcodeScanner.scanBarcode(options);

      // Retirer la classe CSS après le scan
      document.body.classList.remove('scanner-active');

      // Vérifier si un contenu a été scanné
      if (result.ScanResult) {
        return result.ScanResult; // Renvoie le contenu du QR code
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du scan QR:', error);
      // Toujours réactiver l'arrière-plan même en cas d'erreur
      document.body.classList.remove('scanner-active');
      throw error;
    }
  }

  /**
   * Arrête le scan du QR code, si possible.
   * Note: Le plugin officiel ne fournit pas de méthode stopScan.
   * Vous pouvez implémenter une logique pour fermer le scanner si nécessaire.
   */
  async stopScan() {
    try {
      document.body.classList.remove('scanner-active');
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du scan QR:', error);
    }
  }
}
