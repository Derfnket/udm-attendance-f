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
  IonBadge, IonFooter, IonBackButton } from '@ionic/angular/standalone';
import { CartService } from '../services/cart.service'; 
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonFooter, 
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
  private authService = inject(AuthService); // Injectez AuthService

  constructor(private router: Router) {}

  ngOnInit() {
    this.cartSub = this.cartService.cart.subscribe({
      next: (cart) => {
        console.log(cart);
        this.totalItems = cart ? cart?.totalItem : 0;
      },
    });

    // Charger les informations de l'utilisateur, y compris l'image de profil
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.authService.getUserProfile().subscribe({
        next: (response: any) => {
          const user = response.data;
          this.userName = user.username || 'UdM User';
          this.profileImage = user.profileImage || '/assets/imgs/avatar.jpg';
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du profil:', error);
        },
      });
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
