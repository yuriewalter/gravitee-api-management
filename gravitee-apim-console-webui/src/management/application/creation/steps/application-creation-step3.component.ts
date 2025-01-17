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

import { filter, find, includes, join, map, uniqBy } from 'lodash';

import { ApiService } from '../../../../services/api.service';
import { PlanSecurityType } from '../../../../entities/plan/plan';

const ApplicationCreationStep3Component: ng.IComponentOptions = {
  require: {
    parent: '^createApplication',
  },
  template: require('html-loader!./application-creation-step3.html'),
  controller: [
    'ApiService',
    '$scope',
    function (ApiService: ApiService, $scope) {
      this.onSelectAPI = (api) => {
        if (api) {
          const authorizedSecurity = this.getAuthorizedSecurity();
          ApiService.getApiPlans(api.id, 'PUBLISHED').then((response) => {
            const filteredPlans = filter(response.data, (plan) => {
              return includes(authorizedSecurity, plan.security);
            });
            this.plans = map(filteredPlans, (plan) => {
              const selectedPlan = find(this.parent.selectedPlans, { id: plan.id });
              if (selectedPlan) {
                return selectedPlan;
              }
              return plan;
            });
            this.selectedAPI = api;
            this.refreshPlansExcludedGroupsNames();
          });
        } else {
          delete this.plans;
          delete this.selectedAPI;
        }
      };

      this.getAuthorizedSecurity = (): string[] => {
        const authorizedSecurity = [PlanSecurityType.API_KEY];
        if (this.parent.application.settings) {
          if (
            this.parent.application.settings.oauth ||
            (this.parent.application.settings.app && this.parent.application.settings.app.client_id)
          ) {
            authorizedSecurity.push(PlanSecurityType.JWT, PlanSecurityType.OAUTH2);
          }
        }
        return authorizedSecurity;
      };

      this.getSelectedAPIs = (): any[] => {
        const selectedAPIs = uniqBy(this.parent.selectedAPIs, 'id');
        map(selectedAPIs, (api: any) => {
          const selectedPlans = filter(this.parent.selectedPlans, (plan) => {
            return plan.apis.indexOf(api.id) !== -1;
          });
          api.plans = join(map(selectedPlans, 'name'), ', ');
        });
        return selectedAPIs;
      };

      $scope.$watch(
        '$ctrl.parent.application.settings',
        () => {
          this.parent.selectedAPIs = [];
          this.parent.selectedPlans = [];
          delete this.plans;
          delete this.selectedAPI;
          delete this.filterAPI;
        },
        true,
      );

      this.refreshPlansExcludedGroupsNames = () => {
        this.plans.forEach(
          (plan) =>
            (plan.excluded_groups_names = plan.excluded_groups?.map(
              (excludedGroupId) => this.parent.groups.find((apiGroup) => apiGroup.id === excludedGroupId)?.name,
            )),
        );
      };
    },
  ],
};

export default ApplicationCreationStep3Component;
