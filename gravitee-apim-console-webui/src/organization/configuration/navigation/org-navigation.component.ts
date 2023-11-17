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

import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LicenseOptions, GioLicenseService } from '@gravitee/ui-particles-angular';
import { Router } from '@angular/router';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Constants } from '../../../entities/Constants';
import { ApimFeature, UTMTags } from '../../../shared/components/gio-license/gio-license-data';

interface MenuItem {
  routerLink: string;
  displayName: string;
  permissions?: string[];
  licenseOptions?: LicenseOptions;
  iconRight$?: Observable<any>;
}

interface GroupItem {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'org-navigation',
  styles: [require('./org-navigation.component.scss')],
  template: require('./org-navigation.component.html'),
})
export class OrgNavigationComponent implements OnInit {
  public groupItems: GroupItem[] = [];
  constructor(
    private readonly router: Router,
    private readonly permissionService: GioPermissionService,
    @Inject('Constants') private readonly constants: Constants,
    private readonly gioLicenseService: GioLicenseService,
  ) {}
  ngOnInit(): void {
    this.appendConsoleItems();
    this.appendUserManagementItems();
    this.appendGatewayItems();
    this.appendNotificationsItems();
    this.appendAuditItems();
    this.appendCockpitItems();
  }

  private filterMenuByPermission(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.filter((item) => !item.permissions || this.permissionService.hasAnyMatching(item.permissions));
  }

  private appendConsoleItems() {
    const items = this.filterMenuByPermission([
      {
        displayName: 'Authentication',
        routerLink: 'identities',
        permissions: ['organization-identity_provider-r'],
      },
      {
        displayName: 'Settings',
        routerLink: 'settings',
        permissions: ['organization-settings-r'],
      },
    ]);
    if (items.length > 0) {
      this.groupItems.push({
        title: 'Console',
        items,
      });
    }
  }

  private appendUserManagementItems() {
    const items = this.filterMenuByPermission([
      {
        displayName: 'Users',
        routerLink: 'users',
        permissions: ['organization-user-c', 'organization-user-r', 'organization-user-u', 'organization-user-d'],
      },
      {
        displayName: 'Roles',
        routerLink: 'roles',
        permissions: ['organization-role-r'],
      },
    ]);
    if (items.length > 0) {
      this.groupItems.push({
        title: 'User Management',
        items,
      });
    }
  }

  private appendGatewayItems() {
    const items = this.filterMenuByPermission([
      {
        displayName: 'Sharding tags',
        routerLink: 'tags',
        permissions: ['organization-tag-r'],
      },
      {
        displayName: 'Tenants',
        routerLink: 'tenants',
        permissions: ['organization-tenant-r'],
      },
      {
        displayName: 'Policies',
        routerLink: 'policies',
        permissions: ['organization-policies-r'],
      },
    ]);

    if (items.length > 0) {
      this.groupItems.push({
        title: 'Gateway',
        items,
      });
    }
  }

  private appendNotificationsItems() {
    const items = this.filterMenuByPermission([
      {
        displayName: 'Templates',
        routerLink: 'notification-templates',
        permissions: ['organization-notification_templates-r'],
      },
    ]);

    if (items.length > 0) {
      this.groupItems.push({
        title: 'Notifications',
        items,
      });
    }
  }

  private appendAuditItems() {
    const licenseOptions = { feature: ApimFeature.APIM_AUDIT_TRAIL, context: UTMTags.CONTEXT_ORGANIZATION };
    const iconRight$ = this.gioLicenseService.isMissingFeature$(licenseOptions).pipe(map((notAllowed) => (notAllowed ? 'gio:lock' : null)));
    const items = this.filterMenuByPermission([
      {
        displayName: 'Audit',
        routerLink: 'audit',
        licenseOptions,
        iconRight$,
      },
    ]);

    if (items.length > 0) {
      this.groupItems.push({
        title: 'Audit',
        items,
      });
    }
  }

  private appendCockpitItems() {
    const items = this.filterMenuByPermission([
      {
        displayName: 'Discover cockpit',
        routerLink: 'cockpit',
        permissions: ['organization-installation-r'],
      },
    ]);

    const groupItem = {
      title: 'Cockpit',
      items,
    };

    if (items.length > 0) {
      this.groupItems.push(groupItem);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
