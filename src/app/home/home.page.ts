// src/app/pages/home/home.page.ts

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  IonThumbnail,
  IonList,
  IonListHeader,
  IonRow,
  IonCol,
  IonCard,
  IonToast,
  IonBadge,
  IonFooter,
  IonBackButton
} from '@ionic/angular/standalone';
import { CartService } from '../services/cart.service'; 
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service'; // Importer StorageService

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonFooter,
    IonBadge,
    IonToast,
    IonCard,
    IonCol,
    IonRow,
    IonListHeader,
    IonList,
    IonText,
    IonLabel,
    IonItem,
    IonIcon,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonThumbnail,
    RouterLink,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  isToast = false;
  toastData: any = {};
  totalItems: number = 0;
  profileImage: string = '/assets/imgs/avatar.jpg'; // Image par défaut
  userName: string = 'UdM User'; // Nom d'utilisateur par défaut
  cartSub!: Subscription;
  private cartService = inject(CartService);
  private authService = inject(AuthService); // Injection d'AuthService
  private storageService = inject(StorageService); // Injection de StorageService

  constructor(private router: Router) {}

  ngOnInit() {
     // Charger les informations de l'utilisateur, y compris l'image de profil
     this.loadUserProfile();
    }

    async loadUserProfile() {
      const token = await this.storageService.getItem('authToken');
      const userId = await this.storageService.getItem('userId');
    
      if (!token || !userId) {
        console.error("Erreur: Aucun token d'authentification ou ID utilisateur trouvé.");
        return;
      }
    
      try {
        const userProfileResponse = await this.authService.getUserProfile();
        userProfileResponse.subscribe({
          next: (response: any) => {
            console.log("Profil utilisateur récupéré:", response);
            // Mettre à jour l'interface utilisateur avec les données du profil
          },
          error: (error: any) => {
            console.error("Erreur lors de la récupération du profil:", error);
            if (error.status === 200) {
              console.error("La réponse est peut-être au format HTML inattendu :", error.error.text);
            }
          },
        });
      } catch (e) {
        console.error("Exception lors de la récupération du profil utilisateur:", e);
      }
    }
    
  goToArrival() {
    this.router.navigate(['/arrival']);
  }

  goToDeparture() {
    this.router.navigate(['/departure']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
  }
}
