import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service'; 
import { GeolocationService } from 'src/app/services/geolocation.service';
import { QrScannerService } from 'src/app/services/qr-scanner.service'; 

@Component({
  selector: 'app-departure',
  templateUrl: './departure.page.html',
  styleUrls: ['./departure.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule],
})
export class DeparturePage implements OnInit, OnDestroy {
  scannedResult: string | null = null;

  constructor(
    private authService: AuthService,
    private qrScannerService: QrScannerService,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Initialisation si nécessaire
  }

  async startScan() {
    const loading = await this.loadingController.create({
      message: 'Veuillez patienter...',
    });
    await loading.present();

    try {
      console.log("Démarrage du scan QR pour le départ.");
      const qrCode = await this.qrScannerService.startScan();
      if (!qrCode) {
        throw new Error('Le QR code scanné est vide.');
      }

      this.scannedResult = qrCode;

      // Vérification biométrique
      console.log("Vérification biométrique en cours...");
      const biometricToken = await this.authService.verifyBiometric('Authentification biométrique pour le départ');
      if (!biometricToken) {
        throw new Error('Échec de la vérification biométrique. Assurez-vous d\'utiliser vos paramètres biométriques enregistrés.');
      }

      // Récupération de la géolocalisation
      console.log("Récupération de la géolocalisation...");
      const location = await this.geolocationService.getCurrentLocation();
      if (!location) {
        throw new Error('Impossible d\'obtenir la localisation GPS. Activez votre GPS et réessayez.');
      }

      // Enregistrement du départ
      console.log("Enregistrement du départ...");
      await (await this.authService.recordDeparture(qrCode, location.latitude, location.longitude, biometricToken)).toPromise();
      await this.presentToast('Départ enregistré avec succès.');
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement du départ:", error.message);
      await this.presentAlert('Erreur', error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      await loading.dismiss();
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  ngOnDestroy() {
    this.qrScannerService.stopScan();
  }
}
