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
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GioMenuService } from '@gravitee/ui-particles-angular';
import { ActivatedRoute, Router } from '@angular/router';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';

interface MenuItem {
  routerLink?: string;
  displayName: string;
  permissions?: string[];
}

interface GroupItem {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'settings-navigation',
  templateUrl: './settings-navigation.component.html',
  styleUrls: ['./settings-navigation.component.scss'],
})
export class SettingsNavigationComponent implements OnInit {
  public groupItems: GroupItem[] = [];
  public hasBreadcrumb = false;
  private unsubscribe$ = new Subject();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly permissionService: GioPermissionService,
    private readonly gioMenuService: GioMenuService,
  ) {}

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe((reduced) => {
      this.hasBreadcrumb = reduced;
    });

    this.groupItems = [
      {
        title: 'Portal',
        items: [
          {
            displayName: 'Analytics',
            routerLink: './analytics',
            permissions: ['environment-dashboard-r'],
          },
          {
            displayName: 'API Portal Information',
            routerLink: './api-portal-header',
            permissions: ['environment-api_header-r'],
          },
          {
            displayName: 'API Quality',
            routerLink: './api-quality-rules',
            permissions: ['environment-quality_rule-r'],
          },
          {
            displayName: 'Authentication',
            routerLink: './identity-providers',
            permissions: ['organization-identity_provider-r', 'environment-identity_provider_activation-r'],
          },
          {
            displayName: 'Categories',
            routerLink: './categories',
            permissions: ['environment-category-r'],
          },
          {
            displayName: 'Client Registration',
            routerLink: './client-registration-providers',
            permissions: ['environment-client_registration_provider-r'],
          },
          {
            displayName: 'Documentation',
            routerLink: './documentation',
            permissions: ['environment-documentation-c', 'environment-documentation-u', 'environment-documentation-d'],
          },
          {
            displayName: 'Metadata',
            routerLink: './metadata',
            permissions: ['environment-metadata-r'],
          },
          {
            displayName: 'Settings',
            routerLink: './portal',
            permissions: ['environment-settings-r'],
          },
          {
            displayName: 'Theme',
            routerLink: './theme',
            permissions: ['environment-theme-r'],
          },
          {
            displayName: 'Top APIs',
            routerLink: './top-apis',
            permissions: ['environment-top_apis-r'],
          },
        ],
      },
      {
        title: 'Gateway',
        items: [
          {
            displayName: 'API Logging',
            routerLink: './api-logging',
            permissions: ['organization-settings-r'],
          },
          {
            displayName: 'Dictionaries',
            routerLink: './dictionaries',
            permissions: ['environment-dictionary-r'],
          },
        ],
      },
      {
        title: 'User Management',
        items: [
          {
            displayName: 'User Fields',
            routerLink: './custom-user-fields',
            permissions: ['organization-custom_user_fields-r'],
          },
          {
            displayName: 'Groups',
            routerLink: './groups',
            permissions: ['environment-group-r'],
          },
        ],
      },
    ];

    const notificationGroupItem: GroupItem = {
      title: 'Notifications',
      items: [
        {
          displayName: 'Notification settings',
          routerLink: './notifications',
          permissions: ['environment-notification-r'],
        },
      ],
    };
    this.groupItems.push(notificationGroupItem);

    this.groupItems.forEach((groupItem) => {
      groupItem.items = groupItem.items.filter((item) => !item.permissions || this.permissionService.hasAnyMatching(item.permissions));
    });
  }

  isActive(item: MenuItem): boolean {
    return this.router.isActive(this.router.createUrlTree([item.routerLink], { relativeTo: this.activatedRoute }), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  public computeBreadcrumbItems(): string[] {
    const breadcrumbItems: string[] = [];

    this.groupItems.forEach((groupItem) => {
      groupItem.items.forEach((item) => {
        if (this.isActive(item)) {
          breadcrumbItems.push(groupItem.title);
          breadcrumbItems.push(item.displayName);
        }
      });
    });

    return breadcrumbItems;
  }
}
