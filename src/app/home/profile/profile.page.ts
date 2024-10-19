// src/app/pages/profile/profile.page.ts

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, LoadingController, AlertController, NavController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service'; // Importer StorageService

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  user: any;
  profileImage: string | null = null;
  server = 'https://udm-attendance.loca.lt'; // Remplacer par l'URL de votre serveur

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router,
    private storageService: StorageService // Injection de StorageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadUserProfile();
  }

  initForm() {
    this.profileForm = new FormGroup({
      username: new FormControl({ value: '', disabled: true }, Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl({ value: '', disabled: true }, Validators.required),
    });
  }

  async loadUserProfile() {
    const token = await this.storageService.getItem('authToken');
    const userId = await this.storageService.getItem('userId');
  
    if (!token || !userId) {
      console.error("Erreur: Aucun token d'authentification ou ID utilisateur trouvé.");
      return;
    }
  
    try {
      // Utiliser await pour obtenir directement la réponse de getUserProfile
      const userProfileResponse = await this.authService.getUserProfile();
      console.log("Profil utilisateur récupéré:", userProfileResponse);
  
      if (userProfileResponse && userProfileResponse.data) {
        this.user = userProfileResponse.data;
        this.profileForm.patchValue({
          username: this.user.username,
          email: this.user.email,
          role: this.user.role,
        });
        this.profileImage = this.user.profileImage ?? '/assets/imgs/avatar.jpg';
      } else {
        console.warn("Les données de l'utilisateur sont manquantes ou incorrectes.");
      }
    } catch (e: any) {
      console.error("Exception lors de la récupération du profil utilisateur:", e);
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Impossible de charger le profil utilisateur.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
  
  
  
  decodeToken(token: string): any {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
  }

  async updateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Mise à jour du profil...',
    });
    await loading.present();

    this.authService.updateUserProfile(this.profileForm.value).subscribe({
      next: async () => {
        console.log('Profil mis à jour avec succès');
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Profil mis à jour avec succès',
          duration: 2000,
          position: 'bottom',
        });
        toast.present();
      },
      error: async () => {
        console.error('Erreur lors de la mise à jour du profil');
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Erreur lors de la mise à jour du profil.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  async changeProfileImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 50, // Réduisez la qualité pour réduire la taille de l'image
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
  
      // Assurez-vous que l'image est bien convertie en base64
      this.profileImage = image.dataUrl ?? ''; // Assigner l'image récupérée
  
      const loading = await this.loadingController.create({
        message: 'Mise à jour de la photo de profil...',
      });
      await loading.present();
  
      this.authService.updateProfileImage(this.profileImage).subscribe({
        next: async () => {
          console.log('Photo de profil mise à jour avec succès');
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Photo de profil mise à jour avec succès',
            duration: 2000,
            position: 'bottom',
          });
          toast.present();
        },
        error: async (error) => {
          console.error('Erreur lors de la mise à jour de la photo de profil', error);
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Erreur',
            message: 'Impossible de mettre à jour la photo de profil.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
    } catch (e) {
      console.log('Erreur lors du changement de la photo de profil', e);
    }
  }
   
  goBack() {
    this.navCtrl.back();
  }
}