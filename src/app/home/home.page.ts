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
  IonBackButton,
  AlertController // Ajouté pour l'utilisation des alertes
} from '@ionic/angular/standalone';
import { CartService } from '../services/cart.service'; 
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { StorageService } from '../services/storage.service'; // Importer StorageService

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    CommonModule,
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
  private alertController = inject(AlertController); // Injection d'AlertController

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
      console.log("Profil utilisateur récupéré:", userProfileResponse);
  
      if (userProfileResponse && userProfileResponse.data) {
        this.userName = userProfileResponse.data.username || 'UdM User';
        console.log("Nom d'utilisateur défini :", this.userName); // Ajout d'un log pour vérifier
        this.profileImage = userProfileResponse.data.profileImage ?? '/assets/imgs/avatar.jpg';
      } else {
        console.warn("Les données de l'utilisateur sont manquantes ou incorrectes.");
      }
    } catch (e: any) {
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
