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
import { InteractivityChecker } from '@angular/cdk/a11y';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { ActivatedRoute } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';

import { ApplicationGeneralGroupsComponent } from './application-general-groups.component';

import { ApplicationGeneralUserGroupModule } from '../application-general-user-group.module';
import { User } from '../../../../../entities/user';
import { CurrentUserService } from '../../../../../ajs-upgraded-providers';
import { fakeApplication } from '../../../../../entities/application/Application.fixture';
import { CONSTANTS_TESTING, GioHttpTestingModule } from '../../../../../shared/testing';
import { fakeGroup, Group } from '../../../../../entities/management-api-v2';
import { Application } from '../../../../../entities/application/application';

describe('ApplicationGeneralGroupsComponent', () => {
  let fixture: ComponentFixture<ApplicationGeneralGroupsComponent>;
  let httpTestingController: HttpTestingController;
  let loader: HarnessLoader;
  const APPLICATION_ID = 'id_test';
  const currentUser = new User();
  currentUser.userPermissions = ['application-member-u', 'application-member-d', 'application-member-c', 'application-member-r'];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ApplicationGeneralUserGroupModule, GioHttpTestingModule, MatIconTestingModule],
      providers: [{ provide: CurrentUserService, useValue: { currentUser, applicationId: APPLICATION_ID } }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideProvider(InteractivityChecker, {
        useValue: {
          isFocusable: () => true, // This checks focus trap, set it to true to  avoid the warning
          isTabbable: () => true,
        },
      })
      .overrideProvider(ActivatedRoute, { useValue: { snapshot: { params: { applicationId: APPLICATION_ID } } } });

    fixture = TestBed.createComponent(ApplicationGeneralGroupsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  describe('List groups', () => {
    it('should show all application groups', async () => {
      const applicationDetails = fakeApplication();
      const fakeGroups = [fakeGroup()];
      expectListApplicationRequest(applicationDetails);
      expectGetGroupsListRequest(fakeGroups);
      const groupFormField = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: 'Groups' }));
      expect(groupFormField).toBeTruthy();
    });
  });

  function expectGetGroupsListRequest(groups: Group[]) {
    httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.baseURL}/configuration/groups`, method: 'GET' }).flush(groups);
    fixture.detectChanges();
  }

  function expectListApplicationRequest(applicationDetails: Application) {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.baseURL}/applications/${APPLICATION_ID}`,
        method: 'GET',
      })
      .flush(applicationDetails);
  }
});
