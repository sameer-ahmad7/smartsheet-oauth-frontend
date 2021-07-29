import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  userUrl = `${environment.baseUrl}/api/user`;
  authUrl = `${environment.baseUrl}/api/auth`;

  private userData: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private imageTimer: any;
  private refreshToken: string;
  private authStatusListener = new BehaviorSubject<boolean>(false);
  private authError = new Subject<string>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private platform: Platform
  ) {
    this.getAuthStatusListener().subscribe((isAuth) => {
      if (isAuth) {
        this.getCurrentUser();
      }
    });
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  get authError$() {
    return this.authError.asObservable();
  }

  get userData$() {
    return this.userData.asObservable();
  }

  getCurrentUser() {
    this.http
      .get<User>(this.userUrl)
      .pipe(take(1))
      .subscribe((user) => {
        if (user) {
          if (user.imageExpiresIn > 0) {
            this.setImageTimer(+user.imageExpiresIn);
          }
          this.userData.next(user);
        }
      });
  }

  login(accessToken: string, refreshToken: string, expiresInDuration: number) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.isAuthenticated = true;
    this.setAuthTimer(expiresInDuration);
    this.isAuthenticated = true;
    this.authStatusListener.next(true);
    const now = new Date();
    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
    console.log(expirationDate);
    this.saveAuthData(accessToken, refreshToken, expirationDate);
    this.router.navigate(['/'], { replaceUrl: true });
  }

  async autoAuthUser() {
    const authInformation = await this.getAuthData();
    if (!authInformation) {
      return false;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.refreshToken = authInformation.refreshToken;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
      console.log('auto');
      return true;
    }
    return false;
  }

  checkUserOrganization(token: string) {
    return this.http.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>(this.authUrl + '/' + token, {
      appSecret: environment.appSecret,
      appClientId: environment.appClientId,
    });
  }

  refreshAccessToken() {
    return this.http.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>(this.authUrl, { token: this.refreshToken });
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    clearTimeout(this.imageTimer);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  ngOnDestroy() {
    this.logout();
  }

  private setImageTimer(duration: number) {
    this.imageTimer = setTimeout(() => {
      this.getCurrentUser();
    }, duration);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      if (
        (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
        this.platform.is('desktop')
      ) {
        this.logout();
      } else {
        this.refreshAccessToken()
          .pipe(take(1))
          .subscribe((resp) => {
            if (resp) {
              this.login(resp.accessToken, resp.refreshToken, +resp.expiresIn);
            }
          });
      }
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    refreshToken: string,
    expirationDate: Date
  ) {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiration', expirationDate.toISOString());
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      Storage.set({ key: 'token', value: token });
      Storage.set({ key: 'refreshToken', value: refreshToken });
      Storage.set({ key: 'expiration', value: expirationDate.toISOString() });
    }
  }

  private clearAuthData() {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('expiration');
      localStorage.removeItem('refreshToken');
    } else {
      Storage.remove({ key: 'token' });
      Storage.remove({ key: 'expiration' });
      Storage.remove({ key: 'refreshToken' });
    }
  }

  private async getAuthData() {
    let token = '';
    let expirationDate = '';
    let refreshToken = '';
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      token = localStorage.getItem('token');
      expirationDate = localStorage.getItem('expiration');
      refreshToken = localStorage.getItem('refreshToken');
    } else {
      token = (await Storage.get({ key: 'token' })).value;
      expirationDate = (await Storage.get({ key: 'expiration' })).value;
      refreshToken = (await Storage.get({ key: 'refreshToken' })).value;
    }
    if (!token || !expirationDate || !refreshToken) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      refreshToken,
    };
  }
}
