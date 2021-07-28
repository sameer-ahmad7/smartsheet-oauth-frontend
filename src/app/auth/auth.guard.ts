import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private userService: UserService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
  return this.userService.getAuthStatusListener().pipe(
    take(1),
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return this.userService.autoAuthUser();
      } else {
        return of(isAuthenticated);
      }
    }),
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigateByUrl('/login');
      }
    })
  );
}
}
