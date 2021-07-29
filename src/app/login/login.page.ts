import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import {
  OAuth2AuthenticateOptions,
  OAuth2Client,
} from '@byteowls/capacitor-oauth2';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private iab: InAppBrowser,
    private platform: Platform,
    private authService: UserService,
    private alertCtrl: AlertController,
    public loadingController: LoadingController
  ) {}

  ngOnInit() {}

  async login() {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      const oauth2Options: OAuth2AuthenticateOptions = {
        authorizationBaseUrl: 'https://app.smartsheet.com/b/authorize',
        appId: environment.appClientId,
        scope: environment.accessScope,
        responseType: 'code',
        redirectUrl: environment.redirectUrl,
        web: {
          windowOptions: 'width=500,height=500',
        },
      };
      const loading = await this.loadingController.create({
        message: 'Logging in',
      });
      await loading.present();
      OAuth2Client.authenticate(oauth2Options)
        .then((response) => {
          console.log(response);
          this.authService
            .checkUserOrganization(response.code)
            .toPromise()
            .then((resp) => {
              loading.dismiss();
              this.authService.login(
                resp.accessToken,
                resp.refreshToken,
                +resp.expiresIn
              );
            })
            .catch((error) => {
              loading.dismiss();
              console.log(error);
              this.showAlert('Invalid credentials');
            });
        })
        .catch((reason) => {
          loading.dismiss();
          console.log('Oauth rejected', reason);
        });
    } else {
      const browser = this.iab.create(environment.authUrl, '_system', {
        location: 'no',
      });
    }
  }
  private async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Authentication failed',
      message,
      buttons: ['Okay'],
    });
    await alert.present();
  }
}
