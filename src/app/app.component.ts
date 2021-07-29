/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { UserService } from './services/user.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private userService: UserService,
    private platform: Platform,
    private zone: NgZone,
    private http: HttpClient
  ) {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
    } else {
      this.initializeApp();
    }
  }
  initializeApp() {
    App.addListener('appUrlOpen', (data: any) => {
      this.zone.run(() => {
        const url: string = data.url;
        console.log(url);
        if (url.includes('success')) {
          let urlSplit = url.split('?');
          urlSplit = urlSplit[1].split('=');
          const accessToken = urlSplit[1].split('&')[0];
          const expiresIn = +urlSplit[2].split('&')[0];
          const refreshToken = urlSplit[3];
          console.log('url split', urlSplit);
          console.log('accessToken', accessToken);
          console.log('expires in', expiresIn);
          console.log('refresh token', refreshToken);
          this.userService.login(accessToken, refreshToken, expiresIn);
        }
      });
    });
  }
}
