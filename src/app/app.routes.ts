import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  {
    path: 'arrival',
    loadComponent: () => import('./home/arrival/arrival.page').then((m) => m.ArrivalPage),
  },
  {
    path: 'departure',
    loadComponent: () => import('./home/departure/departure.page').then((m) => m.DeparturePage),
  },
  {
    path: 'profile', // Nouvelle route pour le profil
    loadComponent: () => import('./home/profile/profile.page').then((m) => m.ProfilePage),
  },
  { path: 'history', loadComponent: () => import('./home/history/history.page').then(m => m.HistoryPage) },  // Assurez-vous que cette route est bien présente
  //{ path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) },
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];
