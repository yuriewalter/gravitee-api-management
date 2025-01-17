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
import { Inject, Injectable } from '@angular/core';

import { MenuGroupItem, MenuItem } from './MenuGroupItem';
import { ApiMenuService } from './ApiMenuService';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Constants } from '../../../entities/Constants';
import { GioRoleService } from '../../../shared/components/gio-role/gio-role.service';
import { ApiV4 } from '../../../entities/management-api-v2';

@Injectable()
export class ApiV4MenuService implements ApiMenuService {
  constructor(
    private readonly permissionService: GioPermissionService,
    private readonly roleService: GioRoleService,
    @Inject('Constants') private readonly constants: Constants,
  ) {}
  public getMenu(api: ApiV4): {
    subMenuItems: MenuItem[];
    groupItems: MenuGroupItem[];
  } {
    const hasTcpListeners = api.listeners.find((listener) => listener.type === 'TCP') != null;
    const subMenuItems: MenuItem[] = [
      {
        displayName: 'Policy Studio',
        routerLink: hasTcpListeners ? 'DISABLED' : 'v4/policy-studio',
        tabs: undefined,
      },
    ];

    const logsTabs = [];
    if (this.permissionService.hasAnyMatching(['api-log-r'])) {
      logsTabs.push({
        displayName: 'Connections',
        routerLink: 'v4/runtime-logs',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-definition-u', 'api-log-u'])) {
      logsTabs.push({
        displayName: 'Settings',
        routerLink: 'v4/runtime-logs-settings',
      });
    }
    if (logsTabs.length > 0) {
      subMenuItems.push({
        displayName: 'Analytics and logs',
        routerLink: hasTcpListeners ? 'DISABLED' : '',
        header: {
          title: 'Runtime Logs',
          subtitle: 'Debug and Optimize your API by displaying logs from your API runtime activities',
        },
        tabs: logsTabs,
      });
    }
    const groupItems: MenuGroupItem[] = [
      this.getGeneralGroup(),
      this.getEntrypointsGroup(),
      this.getEndpointsGroup(),
      this.getAnalyticsGroup(),
      this.getAuditGroup(),
      this.getNotificationsGroup(),
    ].filter((group) => !!group);

    return { subMenuItems, groupItems };
  }
  private getGeneralGroup(): MenuGroupItem {
    const generalGroup: MenuGroupItem = {
      title: 'General',
      items: [
        {
          displayName: 'Info',
          routerLink: '.',
          routerLinkActiveOptions: { exact: true },
        },
      ],
    };
    // Plans
    const plansMenuItem: MenuItem = {
      displayName: 'Plans',
      tabs: [],
    };

    if (this.permissionService.hasAnyMatching(['api-plan-r'])) {
      plansMenuItem.tabs.push({
        displayName: 'Plans',
        routerLink: 'plans',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-subscription-r'])) {
      plansMenuItem.tabs.push({
        displayName: 'Subscriptions',
        routerLink: 'subscriptions',
      });
    }
    if (plansMenuItem.tabs.length > 0) {
      generalGroup.items.push(plansMenuItem);
    }

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      generalGroup.items.push(
        {
          displayName: 'Properties',
          tabs: [
            {
              displayName: 'Properties',
              routerLink: 'properties',
            },
            {
              displayName: 'Dynamic properties',
              routerLink: 'DISABLED',
            },
          ],
        },
        {
          displayName: 'Resources',
          routerLink: 'resources',
        },
      );
    }

    if (this.permissionService.hasAnyMatching(['api-documentation-r'])) {
      generalGroup.items.push({
        displayName: 'Documentation',
        routerLink: 'v4/documentation',
      });
    }

    // Users
    const userAndGroupAccessMenuItems: MenuItem = {
      displayName: 'User and group access',
      tabs: [],
    };
    if (this.permissionService.hasAnyMatching(['api-member-r'])) {
      userAndGroupAccessMenuItems.tabs.push(
        {
          displayName: 'Members',
          routerLink: 'members',
        },
        {
          displayName: 'Groups',
          routerLink: 'groups',
        },
      );
    }
    if (this.roleService.isOrganizationAdmin() || this.permissionService.hasAnyMatching(['api-member-u'])) {
      userAndGroupAccessMenuItems.tabs.push({
        displayName: 'Transfer ownership',
        routerLink: 'transfer-ownership',
      });
    }
    if (userAndGroupAccessMenuItems.tabs.length > 0) {
      generalGroup.items.push(userAndGroupAccessMenuItems);
    }

    return generalGroup;
  }

  private getEntrypointsGroup(): MenuGroupItem {
    if (this.permissionService.hasAnyMatching(['api-definition-r', 'api-health-r'])) {
      const entrypointsGroup: MenuGroupItem = {
        title: 'Entrypoints',
        items: [
          {
            displayName: 'General',
            routerLink: 'v4/entrypoints',
          },
        ],
      };
      return entrypointsGroup;
    }
    return undefined;
  }

  private getEndpointsGroup(): MenuGroupItem {
    const endpointsGroup: MenuGroupItem = {
      title: 'Endpoints',
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      endpointsGroup.items.push({
        displayName: 'Backend services',
        routerLink: 'v4/endpoints',
      });
    }

    return endpointsGroup;
  }

  private getAnalyticsGroup(): MenuGroupItem {
    const analyticsGroup: MenuGroupItem = {
      title: 'Analytics',
      items: [],
    };
    if (this.permissionService.hasAnyMatching(['api-analytics-r'])) {
      analyticsGroup.items.push({
        displayName: 'Overview',
        routerLink: 'DISABLED',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-definition-u'])) {
      analyticsGroup.items.push({
        displayName: 'Path mappings',
        routerLink: 'DISABLED',
      });
    }
    if (!this.constants.isOEM && this.constants.org.settings.alert?.enabled && this.permissionService.hasAnyMatching(['api-alert-r'])) {
      analyticsGroup.items.push({
        displayName: 'Alerts',
        routerLink: 'DISABLED',
      });
    }

    return analyticsGroup;
  }

  private getAuditGroup(): MenuGroupItem {
    const auditGroup: MenuGroupItem = {
      title: 'Audit',
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-audit-r'])) {
      auditGroup.items.push({
        displayName: 'Audit',
        routerLink: 'DISABLED',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-event-r'])) {
      auditGroup.items.push({
        displayName: 'History',
        routerLink: 'DISABLED',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-event-u'])) {
      auditGroup.items.push({
        displayName: 'Events',
        routerLink: 'DISABLED',
      });
    }

    return auditGroup;
  }

  private getNotificationsGroup(): MenuGroupItem {
    const notificationsGroup: MenuGroupItem = {
      title: 'Notifications',
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-notification-r'])) {
      notificationsGroup.items.push({
        displayName: 'Notification settings',
        routerLink: 'DISABLED',
      });
    }

    if (!this.constants.isOEM && this.constants.org.settings.alert?.enabled && this.permissionService.hasAnyMatching(['api-alert-r'])) {
      notificationsGroup.items.push({
        displayName: 'Alerts',
        routerLink: 'DISABLED',
      });
    }

    return notificationsGroup;
  }
}
