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
import { IScope } from 'angular';

import { size, sortBy } from 'lodash';

import NotificationService from '../../../services/notification.service';
import TopApiService from '../../../services/top-api.service';

class TopApisController {
  private topApis: any[];

  constructor(
    private TopApiService: TopApiService,
    private $mdDialog: angular.material.IDialogService,
    private NotificationService: NotificationService,
    private $rootScope: IScope,
  ) {
    this.$rootScope = $rootScope;
  }

  $onInit() {
    this.refreshTopApis();
  }
  refreshTopApis() {
    this.TopApiService.list().then((response) => {
      this.topApis = response.data;
    });
  }

  showAddTopAPIModal() {
    this.$mdDialog
      .show({
        controller: 'AddTopApiDialogController',
        controllerAs: '$ctrl',
        template: require('html-loader!./dialog/add.top-api.dialog.html'),
        locals: {
          topApis: this.topApis,
        },
      })
      .then((topApis) => {
        if (topApis) {
          this.topApis = topApis;
        }
      });
  }

  delete(topApi) {
    this.$mdDialog
      .show({
        controller: 'DeleteTopApiDialogController',
        template: require('html-loader!./dialog/delete.top-api.dialog.html'),
        locals: {
          topApi: topApi,
        },
      })
      .then((deletedTopApi) => {
        if (deletedTopApi) {
          this.refreshTopApis();
        }
      });
  }

  upward(order) {
    if (order > 0) {
      this.reorder(order, order - 1);
    }
  }

  downward(order) {
    if (order < size(this.topApis) - 1) {
      this.reorder(order, order + 1);
    }
  }

  private reorder(from, to) {
    this.topApis[from].order = to;
    this.topApis[to].order = from;
    this.topApis = sortBy(this.topApis, 'order');
    this.TopApiService.update(this.topApis)
      .then((response) => {
        this.topApis = response.data;
        this.NotificationService.show('Top APIs saved with success');
      })
      .catch(() => {
        this.refreshTopApis();
      });
  }
}
TopApisController.$inject = ['TopApiService', '$mdDialog', 'NotificationService', '$rootScope'];

export default TopApisController;
