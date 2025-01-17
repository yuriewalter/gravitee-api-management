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
import { Injector } from '@angular/core';

class FetcherService {
  constructor(private $http, private Constants) {}

  list(onlyImportFromDirectory?: boolean) {
    const url = `${this.Constants.env.baseURL}/fetchers/?expand=schema` + (onlyImportFromDirectory ? '&import=true' : '');
    return this.$http.get(url);
  }
}
FetcherService.$inject = ['$http', 'Constants'];

export default FetcherService;

export const ajsFetcherServiceProvider = {
  deps: ['$injector'],
  provide: 'ajsFetcherService',
  useFactory: (injector: Injector) => injector.get('FetcherService'),
};
