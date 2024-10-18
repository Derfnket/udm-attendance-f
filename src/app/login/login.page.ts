//login.page.ts
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  NavController,
  LoadingController,
  AlertController,
  ToastController,
  IonicModule,
} from '@ionic/angular';
import { AuthService } from '../services/auth.service'; 
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule, ReactiveFormsModule],
})
export class LoginPage {
  form!: FormGroup;
  isPwdVisible = false;
  server = 'https://udmattendance.loca.lt'; // Remplacez par l'URL de votre serveur
  toastMessage!: string;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  togglePwdVisibility() {
    this.isPwdVisible = !this.isPwdVisible;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Connexion en cours...',
    });
    await loading.present();

    const email = this.form.value.email;
    const password = this.form.value.password;

    this.authService.login(email, password).subscribe({
        next: async (response) => {
          console.log('Réponse du serveur:', response); // Log de la réponse complète
          await loading.dismiss();
      
          if (response && response.user && response.user.id) {
            localStorage.setItem('authToken', response.access_token);
            localStorage.setItem('userId', response.user.id);  // Sauvegarder l'ID utilisateur
            await this.saveCredentials({ email, password });
            this.router.navigate(['/home']);
          } else {
            console.log('Problème avec la réponse utilisateur:', response); // Log si l'utilisateur ou l'ID est absent
            const alert = await this.alertController.create({
              header: 'Erreur de connexion',
              message: 'Réponse inattendue du serveur. Identifiant utilisateur non trouvé.',
              buttons: ['OK'],
            });
            await alert.present();
          }
        },
        error: async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Erreur de connexion',
            message: 'Identifiants incorrects ou problème de connexion.',
            buttons: ['OK'],
          });
          await alert.present();
          console.error('Erreur de connexion:', error);
        },
      });
      
  }

  async performBiometricVerification() {
    try {
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) return;

      const verified = await NativeBiometric.verifyIdentity({
        reason: 'Authentification biométrique',
        title: 'Connexion',
        useFallback: true,
        maxAttempts: 2,
      }).then(() => true).catch(() => false);

      if (!verified) return;

      await this.getCredentials();
    } catch (e) {
      console.log(e);
    }
  }

  async saveCredentials(data: { email: string; password: string }) {
    try {
      if (Capacitor.isNativePlatform()) {
        await NativeBiometric.setCredentials({
          username: data.email,
          password: data.password,
          server: this.server,
        });
        this.showToast('Connexion réussie et identifiants sauvegardés');
      } else {
        console.log('Biometric features are not supported on the web platform.');
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getCredentials() {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: this.server,
      });

      const loading = await this.loadingController.create({
        message: 'Connexion en cours...',
      });
      await loading.present();

      const email = credentials.username;
      const password = credentials.password;

      this.authService.login(email, password).subscribe({
        next: async (response) => {
          await loading.dismiss();
          localStorage.setItem('authToken', response.token);
          this.router.navigate(['/home']);
        },
        error: async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Erreur de connexion',
            message: 'Impossible de se connecter avec les identifiants biométriques.',
            buttons: ['OK'],
          });
          await alert.present();
          console.error('Erreur de connexion:', error);
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async deleteCredentials() {
    try {
      await NativeBiometric.deleteCredentials({
        server: this.server,
      });
      this.showToast('Identifiants biométriques supprimés');
    } catch (e) {
      console.log(e);
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }
}
