import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  constructor(public toastController: ToastController) { }

  /** Async: Pops up a toast message passed into it for 2 seconds */
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

}
