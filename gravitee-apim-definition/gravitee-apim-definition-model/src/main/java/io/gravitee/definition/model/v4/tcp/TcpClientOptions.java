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
package io.gravitee.definition.model.v4.tcp;

import lombok.Data;

/**
 * @author Yann TAVERNIER (yann.tavernier at graviteesource.com)
 * @author GraviteeSource Team
 */
@Data
public class TcpClientOptions {

    public static final int DEFAULT_IDLE_TIMEOUT = 0;
    public static final int DEFAULT_READ_IDLE_TIMEOUT = 0;
    public static final int DEFAULT_WRITE_IDLE_TIMEOUT = 0;

    int connectTimeout = 3000;
    private int reconnectAttempts = 5;
    private int reconnectInterval = 1000;
    private int idleTimeout = DEFAULT_IDLE_TIMEOUT;
    private int readIdleTimeout = DEFAULT_READ_IDLE_TIMEOUT;
    private int writeIdleTimeout = DEFAULT_WRITE_IDLE_TIMEOUT;
}
