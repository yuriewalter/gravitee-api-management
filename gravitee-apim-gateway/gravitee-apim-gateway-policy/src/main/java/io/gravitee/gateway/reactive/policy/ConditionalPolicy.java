/**
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
package io.gravitee.gateway.reactive.policy;

import io.gravitee.definition.model.ConditionSupplier;
import io.gravitee.definition.model.MessageConditionSupplier;
import io.gravitee.gateway.reactive.api.context.GenericExecutionContext;
import io.gravitee.gateway.reactive.api.context.HttpExecutionContext;
import io.gravitee.gateway.reactive.api.context.MessageExecutionContext;
import io.gravitee.gateway.reactive.api.message.Message;
import io.gravitee.gateway.reactive.api.policy.Policy;
import io.gravitee.gateway.reactive.core.condition.ConditionFilter;
import io.gravitee.gateway.reactive.core.condition.MessageConditionFilter;
import io.gravitee.gateway.reactive.core.context.MutableExecutionContext;
import io.gravitee.gateway.reactive.core.context.MutableRequest;
import io.gravitee.gateway.reactive.core.context.MutableResponse;
import io.gravitee.gateway.reactive.core.context.OnMessagesInterceptor;
import io.reactivex.rxjava3.core.Completable;
import io.reactivex.rxjava3.core.FlowableTransformer;
import io.reactivex.rxjava3.core.Single;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Jeoffrey HAEYAERT (jeoffrey.haeyaert at graviteesource.com)
 * @author GraviteeSource Team
 */
public class ConditionalPolicy implements Policy, ConditionSupplier {

    public static final Logger LOGGER = LoggerFactory.getLogger(ConditionalPolicy.class);

    protected final Policy policy;
    protected final String condition;
    protected final ConditionFilter<ConditionalPolicy> conditionFilter;
    protected final boolean conditionDefined;

    public ConditionalPolicy(Policy policy, String condition, ConditionFilter<ConditionalPolicy> conditionFilter) {
        this.policy = policy;
        this.condition = condition;
        this.conditionFilter = conditionFilter;
        this.conditionDefined = condition != null && !condition.isBlank();
    }

    @Override
    public String id() {
        return policy.id();
    }

    @Override
    public Completable onRequest(HttpExecutionContext ctx) {
        return onCondition(ctx, policy.onRequest(ctx));
    }

    @Override
    public Completable onResponse(HttpExecutionContext ctx) {
        return onCondition(ctx, policy.onResponse(ctx));
    }

    @Override
    public Completable onMessageRequest(final MessageExecutionContext ctx) {
        return Completable.complete();
    }

    @Override
    public Completable onMessageResponse(final MessageExecutionContext ctx) {
        return Completable.complete();
    }

    @Override
    public String getCondition() {
        return condition;
    }

    private Completable onCondition(GenericExecutionContext ctx, Completable toExecute) {
        if (!conditionDefined) {
            return toExecute;
        }

        return conditionFilter.filter(ctx, this).flatMapCompletable(conditionalPolicy -> toExecute);
    }
}
