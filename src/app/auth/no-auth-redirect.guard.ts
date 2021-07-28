import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap, map } from 'rxjs/operators';
import { UserService } from '../services/user.service';


@Injectable({
  providedIn: 'root'
})
export class NoAuthRedirectGuard implements CanLoad {
  constructor(private userService: UserService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isAuth = this.userService.getIsAuth();
    if (!isAuth) {
      return true;
    }
    else{
      this.router.navigate(['/'],{replaceUrl:true});
      return false;
    }
    }
}
