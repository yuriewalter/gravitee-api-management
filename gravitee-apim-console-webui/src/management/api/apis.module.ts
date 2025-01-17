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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiAnalyticsModule } from './analytics/api-analytics.module';
import { ApiListModule } from './list/api-list.module';
import { ApiNavigationModule } from './api-navigation/api-navigation.module';
import { ApiProxyModule } from './proxy/api-proxy.module';
import { ApiV4PolicyStudioModule } from './policy-studio-v4/api-v4-policy-studio.module';
import { ApiRuntimeLogsV4Module } from './runtime-logs-v4/api-runtime-logs-v4.module';
import { ApisGeneralModule } from './general/apis-general.module';
import { ApiEndpointsModule } from './endpoints-v4/api-endpoints.module';
import { ApiEntrypointsV4Module } from './entrypoints-v4/api-entrypoints-v4.module';
import { GioPolicyStudioRoutingModule } from './policy-studio-v2/gio-policy-studio-routing.module';
import { ApiAuditModule } from './audit/api-audit.module';
import { ApiV1PoliciesComponent } from './policy-studio-v1/policies/policies.component';
import { ApiNotificationSettingsModule } from './notification-settings/api-notification-settings.module';
import { ApiCreationV2Module } from './creation-v2/api-creation-v2.module';
import { ApiCreationGetStartedModule } from './creation-get-started/api-creation-get-started.module';
import { ApiCreationV4Module } from './creation-v4/api-creation-v4.module';
import { ApiDocumentationV4Module } from './documentation-v4/api-documentation-v4.module';
import { ApisRoutingModule } from './apis-routing.module';

import { SpecificJsonSchemaTypeModule } from '../../shared/components/specific-json-schema-type/specific-json-schema-type.module';
import { DocumentationModule } from '../../components/documentation/documentation.module';
import { AlertsModule } from '../../components/alerts/alerts.module';

@NgModule({
  declarations: [ApiV1PoliciesComponent],
  imports: [
    CommonModule,

    ApisRoutingModule,

    ApiAnalyticsModule,
    ApiListModule,
    ApiNavigationModule,
    ApiV4PolicyStudioModule,
    ApiRuntimeLogsV4Module,
    ApisGeneralModule,
    ApiProxyModule,
    ApiEntrypointsV4Module,
    ApiEndpointsModule,
    ApiAuditModule,
    ApiNotificationSettingsModule,
    GioPolicyStudioRoutingModule,
    SpecificJsonSchemaTypeModule,
    DocumentationModule,
    ApiCreationGetStartedModule,
    ApiCreationV2Module,
    ApiCreationV4Module,
    ApiDocumentationV4Module,
    AlertsModule,
  ],
})
export class ApisModule {}
