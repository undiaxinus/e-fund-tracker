import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const requiredRoles = route.data['roles'] as string[];
        const requiredPermissions = route.data['permissions'] as string[];

        // Check roles
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRole = this.authService.hasAnyRole(requiredRoles);
          if (!hasRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check specific permissions
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = this.checkPermissions(requiredPermissions);
          if (!hasPermission) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }

  private checkPermissions(permissions: string[]): boolean {
    return permissions.every(permission => {
      switch (permission) {
        case 'canEdit':
          return this.authService.canEdit();
        case 'canView':
          return this.authService.canView();
        case 'canManageUsers':
          return this.authService.canManageUsers();
        case 'isAdmin':
          return this.authService.isAdmin();
        case 'isEncoder':
          return this.authService.isEncoder();
        case 'isViewer':
          return this.authService.isViewer();
        default:
          return false;
      }
    });
  }
}