import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { ArrivalService } from 'src/app/services/arrival.service'; 
import { HttpClientModule } from '@angular/common/http';
// import { IonLabel, IonItem, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonCard, IonCardContent, IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { GeolocationService } from 'src/app/services/geolocation.service'; 
import { QrScannerService } from 'src/app/services/qr-scanner.service'; 

@Component({
  selector: 'app-arrival',
  templateUrl: './arrival.page.html',
  styleUrls: ['./arrival.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule],
})
export class ArrivalPage implements OnInit {
  scannedResult: string | null = null;

  constructor(
    private arrivalService: ArrivalService,
    private authService: AuthService,
    private qrScannerService: QrScannerService,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Initier des paramètres si nécessaire
  }

  async startScan() {
    const loading = await this.loadingController.create({
      message: 'Veuillez patienter...',
    });
    await loading.present();

    try {
      const qrCode = await this.qrScannerService.startScan();
      if (!qrCode) {
        throw new Error('Le QR code scanné est vide.');
      }

      this.scannedResult = qrCode;

      // Vérification biométrique
      const biometricToken = await this.authService.verifyBiometric('Authentification biométrique pour l\'arrivée');
      if (!biometricToken) {
        throw new Error('Échec de la vérification biométrique.');
      }

      // Récupération de la géolocalisation
      const location = await this.geolocationService.getCurrentLocation();
      if (!location) {
        throw new Error('Impossible d\'obtenir la localisation GPS.');
      }

      // Enregistrement de l'arrivée
      await this.authService.recordArrival(qrCode, location.latitude, location.longitude, biometricToken).toPromise();
      await this.presentToast('Arrivée enregistrée avec succès.');
    } catch (error: any) {
      await this.presentAlert('Erreur', error.message || 'Une erreur est survenue.');
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
