import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonToolbar, IonTitle, IonFooter, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, bagHandleOutline, barcodeOutline, cartOutline, checkmarkCircle, closeOutline, documentTextOutline, keyOutline, listOutline, lockClosed, logInOutline, logOutOutline, mailOutline, personCircleOutline, remove, scanOutline, trash, eyeOutline, arrowBackOutline  } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet, IonFooter],
})
export class AppComponent {
  public appPages = [
    { title: 'Accueil', url: '/dashboard', icon: 'home' },
    { title: 'Connexion', url: '/login', icon: 'log-in' },
  ];
  constructor() {
    this.addAllIcons();
  }

  addAllIcons() {
    addIcons({
      cartOutline,
      scanOutline,
      listOutline,
      checkmarkCircle,
      bagHandleOutline,
      barcodeOutline,
      closeOutline,
      remove,
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'document-text-outline': documentTextOutline,
      'person-circle-outline': personCircleOutline,
      'lock-closed': lockClosed,
      'mail-outline': mailOutline,
      'key-outline': keyOutline,
      'trash': trash,
      'eye-outline': eyeOutline,
      'arrow-back-outline': arrowBackOutline,
      add
    });
  }
}
