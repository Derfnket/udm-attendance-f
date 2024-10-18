// src/app/pages/history/history.page.ts

import { Component, OnInit } from '@angular/core';
import { PresenceService } from 'src/app/services/presence.service'; 
import { LoadingController, AlertController, NavController, IonicModule } from '@ionic/angular'; // Import NavController
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule],
})
export class HistoryPage implements OnInit {
  history: any[] = [];

  constructor(
    private presenceService: PresenceService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private navCtrl: NavController // Inject NavController
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  async loadHistory() {
    const loading = await this.loadingController.create({
      message: 'Chargement de l\'historique...',
    });
    await loading.present();

    (await this.presenceService.getPresenceHistory()).subscribe({
      next: async (data: any[]) => {
        this.history = data;
        await loading.dismiss();
      },
      error: async (err: any) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger l\'historique.',
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  // Méthode pour revenir à la page précédente
  goBack() {
    this.navCtrl.back();
  }
}
