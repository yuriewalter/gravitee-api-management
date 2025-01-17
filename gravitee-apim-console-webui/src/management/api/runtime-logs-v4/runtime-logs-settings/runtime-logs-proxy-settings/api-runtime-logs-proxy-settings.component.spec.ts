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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ActivatedRoute } from '@angular/router';

import { ApiRuntimeLogsProxySettingsModule } from './api-runtime-logs-proxy-settings.module';
import { ApiRuntimeLogsProxySettingsComponent } from './api-runtime-logs-proxy-settings.component';
import { ApiRuntimeLogsProxySettingsHarness } from './api-runtime-logs-proxy-settings.harness';

import { CONSTANTS_TESTING, GioHttpTestingModule } from '../../../../../shared/testing';
import { ApiV4, fakeApiV4, fakeProxyApiV4 } from '../../../../../entities/management-api-v2';

describe('ApiRuntimeLogsProxySettingsComponent', () => {
  const API_ID = 'api-id';
  let fixture: ComponentFixture<ApiRuntimeLogsProxySettingsComponent>;
  let httpTestingController: HttpTestingController;
  let componentHarness: ApiRuntimeLogsProxySettingsHarness;

  const initComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioHttpTestingModule, ApiRuntimeLogsProxySettingsModule, MatIconTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: { apiId: API_ID } } } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiRuntimeLogsProxySettingsComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    componentHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ApiRuntimeLogsProxySettingsHarness);
  };

  describe('with an API', () => {
    const api = fakeProxyApiV4({ id: API_ID, analytics: { logging: { mode: { entrypoint: false, endpoint: false } } } });

    beforeEach(async () => {
      await initComponent();
    });

    it('should enable and disable form fields according to logging mode', async () => {
      expectApiGetRequest(api);
      expect(await componentHarness.isEntrypointChecked()).toStrictEqual(false);
      expect(await componentHarness.isEntrypointDisabled()).toStrictEqual(false);
      expect(await componentHarness.isEndpointChecked()).toStrictEqual(false);
      expect(await componentHarness.isEndpointDisabled()).toStrictEqual(false);
      expect(await componentHarness.isRequestPhaseChecked()).toStrictEqual(false);
      expect(await componentHarness.isResponsePhaseChecked()).toStrictEqual(false);
      expect(await componentHarness.isHeadersChecked()).toStrictEqual(false);
      expect(await componentHarness.isPayloadChecked()).toStrictEqual(false);
      expect(await componentHarness.getCondition()).toStrictEqual('');
      await checkLoggingFieldsDisabled();

      await componentHarness.toggleEntrypoint();
      await checkLoggingFieldsEnabled();

      await componentHarness.toggleEntrypoint();
      await checkLoggingFieldsDisabled();

      await componentHarness.toggleEndpoint();
      await checkLoggingFieldsEnabled();
    });

    it('should save API proxy logging settings', async () => {
      expectApiGetRequest(api);
      await componentHarness.toggleEntrypoint();
      await componentHarness.toggleEndpoint();
      await componentHarness.toggleRequestPhase();
      await componentHarness.toggleResponsePhase();
      await componentHarness.toggleHeaders();
      await componentHarness.togglePayload();
      await componentHarness.setCondition('condition');

      await componentHarness.clickOnSaveButton();
      expectApiGetRequest(api);
      expectApiPutRequest({
        ...api,
        analytics: {
          ...api.analytics,
          logging: {
            mode: { entrypoint: true, endpoint: true },
            phase: { request: true, response: true },
            content: { headers: true, payload: true },
            condition: 'condition',
          },
        },
      });
    });

    it('should init form with API logging values', async () => {
      const api = fakeProxyApiV4({
        id: API_ID,
        analytics: {
          logging: {
            mode: { entrypoint: true, endpoint: true },
            phase: { request: true, response: true },
            content: { headers: true, payload: true },
            condition: 'condition',
          },
        },
      });
      expectApiGetRequest(api);

      expect(await componentHarness.isEntrypointChecked()).toStrictEqual(true);
      expect(await componentHarness.isEndpointChecked()).toStrictEqual(true);
      expect(await componentHarness.isRequestPhaseChecked()).toStrictEqual(true);
      expect(await componentHarness.isResponsePhaseChecked()).toStrictEqual(true);
      expect(await componentHarness.isHeadersChecked()).toStrictEqual(true);
      expect(await componentHarness.isPayloadChecked()).toStrictEqual(true);
      expect(await componentHarness.getCondition()).toStrictEqual('condition');
    });

    it('should disable the fields when it is a kubernetes API', async () => {
      const api = fakeApiV4({ id: API_ID, definitionContext: { origin: 'KUBERNETES' } });
      expectApiGetRequest(api);
      expect(await componentHarness.isEntrypointDisabled()).toStrictEqual(true);
      expect(await componentHarness.isEndpointDisabled()).toStrictEqual(true);
      await checkLoggingFieldsDisabled();
    });

    it('should discard the changes', async () => {
      expectApiGetRequest(api);

      await componentHarness.toggleEntrypoint();
      await componentHarness.toggleEndpoint();
      await componentHarness.toggleRequestPhase();
      await componentHarness.toggleResponsePhase();
      await componentHarness.toggleHeaders();
      await componentHarness.togglePayload();
      await componentHarness.setCondition('condition');

      expect(await componentHarness.isEntrypointChecked()).toStrictEqual(true);
      expect(await componentHarness.isEndpointChecked()).toStrictEqual(true);
      expect(await componentHarness.isRequestPhaseChecked()).toStrictEqual(true);
      expect(await componentHarness.isResponsePhaseChecked()).toStrictEqual(true);
      expect(await componentHarness.isHeadersChecked()).toStrictEqual(true);
      expect(await componentHarness.isPayloadChecked()).toStrictEqual(true);
      expect(await componentHarness.getCondition()).toStrictEqual('condition');
      await checkLoggingFieldsEnabled();

      await componentHarness.clickOnResetButton();

      expect(await componentHarness.isEntrypointChecked()).toStrictEqual(false);
      expect(await componentHarness.isEntrypointDisabled()).toStrictEqual(false);
      expect(await componentHarness.isEndpointChecked()).toStrictEqual(false);
      expect(await componentHarness.isEndpointDisabled()).toStrictEqual(false);
      expect(await componentHarness.isRequestPhaseChecked()).toStrictEqual(false);
      expect(await componentHarness.isResponsePhaseChecked()).toStrictEqual(false);
      expect(await componentHarness.isHeadersChecked()).toStrictEqual(false);
      expect(await componentHarness.isPayloadChecked()).toStrictEqual(false);
      expect(await componentHarness.getCondition()).toStrictEqual('');
      await checkLoggingFieldsDisabled();
    });
  });

  function expectApiGetRequest(api: ApiV4) {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${api.id}`,
        method: 'GET',
      })
      .flush(api);
    fixture.detectChanges();
  }

  function expectApiPutRequest(api: ApiV4) {
    const req = httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${api.id}`, method: 'PUT' });
    expect(req.request.body).toStrictEqual(api);
    req.flush(api);
    fixture.detectChanges();
  }

  async function checkLoggingFieldsDisabled() {
    expect(await componentHarness.isRequestPhaseDisabled()).toStrictEqual(true);
    expect(await componentHarness.isResponsePhaseDisabled()).toStrictEqual(true);
    expect(await componentHarness.isHeadersDisabled()).toStrictEqual(true);
    expect(await componentHarness.isPayloadDisabled()).toStrictEqual(true);
    expect(await componentHarness.isConditionDisabled()).toStrictEqual(true);
  }

  async function checkLoggingFieldsEnabled() {
    expect(await componentHarness.isRequestPhaseDisabled()).toStrictEqual(false);
    expect(await componentHarness.isResponsePhaseDisabled()).toStrictEqual(false);
    expect(await componentHarness.isHeadersDisabled()).toStrictEqual(false);
    expect(await componentHarness.isPayloadDisabled()).toStrictEqual(false);
    expect(await componentHarness.isConditionDisabled()).toStrictEqual(false);
  }
});
