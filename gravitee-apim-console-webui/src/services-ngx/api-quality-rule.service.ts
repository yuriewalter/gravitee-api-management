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
import { ApiQualityRule } from '../entities/apiQualityRule';

@Injectable({
  providedIn: 'root',
})
export class ApiQualityRuleService {
  constructor(private readonly http: HttpClient, @Inject('Constants') private readonly constants: Constants) {}

  getQualityRules(apiId: string): Observable<ApiQualityRule[]> {
    return this.http.get<ApiQualityRule[]>(`${this.constants.env.baseURL}/apis/${apiId}/quality-rules`);
  }

  createQualityRule(apiId: string, qualityRuleId: string, checked: boolean): Observable<void> {
    return this.http.post<void>(`${this.constants.env.baseURL}/apis/${apiId}/quality-rules`, {
      api: apiId,
      quality_rule: qualityRuleId,
      checked: checked,
    });
  }

  updateQualityRule(apiId: string, qualityRuleId: string, checked: boolean): Observable<void> {
    return this.http.put<void>(`${this.constants.env.baseURL}/apis/${apiId}/quality-rules/${qualityRuleId}`, {
      checked: checked,
    });
  }
}
