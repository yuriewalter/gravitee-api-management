/*
 * Copyright © 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.gravitee.rest.api.service.cockpit.command.handler;

import io.gravitee.apim.core.access_point.crud_service.AccessPointCrudService;
import io.gravitee.cockpit.api.command.Command;
import io.gravitee.cockpit.api.command.CommandHandler;
import io.gravitee.cockpit.api.command.CommandStatus;
import io.gravitee.cockpit.api.command.accesspoint.AccessPoint;
import io.gravitee.cockpit.api.command.environment.EnvironmentCommand;
import io.gravitee.cockpit.api.command.environment.EnvironmentPayload;
import io.gravitee.cockpit.api.command.environment.EnvironmentReply;
import io.gravitee.rest.api.model.EnvironmentEntity;
import io.gravitee.rest.api.model.UpdateEnvironmentEntity;
import io.gravitee.rest.api.service.EnvironmentService;
import io.reactivex.rxjava3.core.Single;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * @author Jeoffrey HAEYAERT (jeoffrey.haeyaert at graviteesource.com)
 * @author GraviteeSource Team
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EnvironmentCommandHandler implements CommandHandler<EnvironmentCommand, EnvironmentReply> {

    private final EnvironmentService environmentService;
    private final AccessPointCrudService accessPointService;

    @Override
    public Command.Type handleType() {
        return Command.Type.ENVIRONMENT_COMMAND;
    }

    @Override
    public Single<EnvironmentReply> handle(EnvironmentCommand command) {
        EnvironmentPayload environmentPayload = command.getPayload();

        try {
            UpdateEnvironmentEntity newEnvironment = new UpdateEnvironmentEntity();
            newEnvironment.setCockpitId(environmentPayload.getCockpitId());
            newEnvironment.setHrids(environmentPayload.getHrids());
            newEnvironment.setName(environmentPayload.getName());
            newEnvironment.setDescription(environmentPayload.getDescription());

            final EnvironmentEntity environment = environmentService.createOrUpdate(
                environmentPayload.getOrganizationId(),
                environmentPayload.getId(),
                newEnvironment
            );
            List<io.gravitee.apim.core.access_point.model.AccessPoint> accessPointsToCreate;
            if (environmentPayload.getAccessPoints() != null) {
                accessPointsToCreate =
                    environmentPayload
                        .getAccessPoints()
                        .stream()
                        .map(cockpitAccessPoint ->
                            io.gravitee.apim.core.access_point.model.AccessPoint
                                .builder()
                                .referenceType(io.gravitee.apim.core.access_point.model.AccessPoint.ReferenceType.ENVIRONMENT)
                                .referenceId(environment.getId())
                                .target(
                                    io.gravitee.apim.core.access_point.model.AccessPoint.Target.valueOf(
                                        cockpitAccessPoint.getTarget().name()
                                    )
                                )
                                .host(cockpitAccessPoint.getHost())
                                .secured(cockpitAccessPoint.isSecured())
                                .overriding(cockpitAccessPoint.isOverriding())
                                .build()
                        )
                        .toList();
            } else {
                accessPointsToCreate = new ArrayList<>();
            }
            accessPointService.updateAccessPoints(
                io.gravitee.apim.core.access_point.model.AccessPoint.ReferenceType.ENVIRONMENT,
                environment.getId(),
                accessPointsToCreate
            );
            log.info("Environment [{}] handled with id [{}].", environment.getName(), environment.getId());
            return Single.just(new EnvironmentReply(command.getId(), CommandStatus.SUCCEEDED));
        } catch (Exception e) {
            log.error(
                "Error occurred when handling environment [{}] with id [{}].",
                environmentPayload.getName(),
                environmentPayload.getId(),
                e
            );
            return Single.just(new EnvironmentReply(command.getId(), CommandStatus.ERROR));
        }
    }
}
