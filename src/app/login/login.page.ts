import { Component, OnInit } from '@angular/core';
import {
  InAppBrowser,
  InAppBrowserEvent,
} from '@ionic-native/in-app-browser/ngx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(private iab: InAppBrowser) {}

  ngOnInit() {}

  login() {
    const browser = this.iab.create(environment.authUrl, '_system', {
      location: 'no',
    });
    //  const listener= browser.on('loadstart').subscribe((event: InAppBrowserEvent)=>{
    //     const url=event.url;
    //     console.log(url);
    //     if(event.url.includes('accessToken')){
    //       listener.unsubscribe();
    //       browser.close();
    //       let urlSplit=url.split('?');
    //       urlSplit=urlSplit[1].split('=');
    //       console.log('url split',urlSplit);
    //     }
    //   });
  }
}
