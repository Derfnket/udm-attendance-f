//profile.page.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, LoadingController, AlertController, NavController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
  server = 'https://b6d7-154-72-150-173.ngrok-free.app'; // Remplacer par l'URL de votre serveur

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router
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
    const loading = await this.loadingController.create({
      message: 'Chargement du profil...',
    });
    await loading.present();
  
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId'); // Récupérer l'ID utilisateur stocké
  
      if (!token || !userId) {
        throw new Error('No auth token or user ID found');
      }
  
      // Faire la requête avec l'ID utilisateur
      this.authService.getUserProfile().subscribe({
        next: async (response: any) => {
          console.log('Profil utilisateur récupéré:', response);  // Log des données récupérées
          this.user = response.data;  // Utilisez `response.data` selon votre structure de réponse
  
          this.profileForm.patchValue({
            username: this.user.username,
            email: this.user.email,
            role: this.user.role,
          });
          this.profileImage = this.user.profileImage ?? '/assets/imgs/avatar.jpg';
          await loading.dismiss();
        },
        error: async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Erreur',
            message: 'Impossible de charger le profil utilisateur.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
    } catch (e) {
      console.error('Erreur lors du chargement du profil:', e);
      await loading.dismiss();
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
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Profil mis à jour avec succès',
          duration: 2000,
          position: 'bottom',
        });
        toast.present();
      },
      error: async () => {
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
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      this.profileImage = image.dataUrl ?? ''; // Ensure profileImage is a string

      const loading = await this.loadingController.create({
        message: 'Mise à jour de la photo de profil...',
      });
      await loading.present();

      this.authService.updateProfileImage(this.profileImage).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Photo de profil mise à jour avec succès',
            duration: 2000,
            position: 'bottom',
          });
          toast.present();
        },
        error: async () => {
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