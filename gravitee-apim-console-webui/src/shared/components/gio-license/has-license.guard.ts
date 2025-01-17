/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { GioLicenseService } from '@gravitee/ui-particles-angular';

export interface GioRequireLicenseRouterData {
  license: {
    feature: string;
  };
  redirect: string;
}

@Injectable({
  providedIn: 'root',
})
export class HasLicenseGuard implements CanActivateChild {
  constructor(private readonly gioLicenseService: GioLicenseService, private readonly router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    const licenseRouterData: GioRequireLicenseRouterData | undefined = route.data.requireLicense;
    if (!licenseRouterData) {
      // no license required
      return of(true);
    }

    return this.gioLicenseService.isMissingFeature$(licenseRouterData.license).pipe(
      map((notAllowed) => {
        if (notAllowed) {
          this.router.navigate([licenseRouterData.redirect]);
          return false;
        }

        return true;
      }),
    );
  }
}
