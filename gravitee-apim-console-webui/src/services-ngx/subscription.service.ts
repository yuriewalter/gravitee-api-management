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
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Constants } from '../entities/Constants';
import { ApplicationSubscription, Subscription } from '../entities/subscription/subscription';
import { PagedResult } from '../entities/pagedResult';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private readonly http: HttpClient, @Inject('Constants') private readonly constants: Constants) {}

  public getApiSubscriptionsByPlan(apiId: string, planId): Observable<PagedResult<Subscription>> {
    return this.http.get<PagedResult<Subscription>>(
      `${this.constants.env.baseURL}/apis/${apiId}/subscriptions?plan=${planId}&status=accepted,pending,rejected,closed,paused`,
    );
  }

  public getApplicationSubscriptions(appId: string): Observable<PagedResult<ApplicationSubscription>> {
    return this.http.get<PagedResult<ApplicationSubscription>>(
      `${this.constants.env.baseURL}/applications/${appId}/subscriptions?expand=security`,
    );
  }
}
