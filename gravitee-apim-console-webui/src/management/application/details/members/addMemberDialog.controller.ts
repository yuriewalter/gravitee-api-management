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

import { findIndex } from 'lodash';

import ApplicationService from '../../../../services/application.service';
import NotificationService from '../../../../services/notification.service';
import RoleService from '../../../../services/role.service';

function DialogAddMemberController(
  $scope,
  $mdDialog,
  application,
  members,
  ApplicationService: ApplicationService,
  NotificationService: NotificationService,
  RoleService: RoleService,
) {
  RoleService.list('APPLICATION').then((roles) => {
    $scope.roles = roles;
  });

  $scope.application = application;
  $scope.members = members;
  $scope.usersSelected = [];

  $scope.userFilterFn = (user: any) => {
    return findIndex($scope.members, { id: user.id }) === -1;
  };

  $scope.hide = function () {
    $mdDialog.cancel();
  };

  $scope.addMembers = function () {
    for (let i = 0; i < $scope.usersSelected.length; i++) {
      const member = $scope.usersSelected[i];
      const membership = {
        id: member.id,
        reference: member.reference,
        role: $scope.role.name,
      };
      ApplicationService.addOrUpdateMember($scope.application.id, membership)
        .then(() => {
          NotificationService.show('User ' + member.displayName + ' has been added as a member.');
        })
        .catch((error) => {
          $scope.error = error;
        });
    }
    $mdDialog.hide($scope.application);
  };
}
DialogAddMemberController.$inject = [
  '$scope',
  '$mdDialog',
  'application',
  'members',
  'ApplicationService',
  'NotificationService',
  'RoleService',
];

export default DialogAddMemberController;
