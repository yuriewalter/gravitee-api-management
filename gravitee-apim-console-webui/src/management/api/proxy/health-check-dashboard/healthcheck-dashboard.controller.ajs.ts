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
import { IQService, IRootScopeService } from 'angular';

import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { assign, forEach } from 'lodash';

import { ApiService, LogsQuery } from '../../../../services/api.service';
import UserService from '../../../../services/user.service';

class ApiHealthcheckDashboardControllerAjs {
  public activatedRoute: ActivatedRoute;
  public chartData: any;

  private api: any;
  private gateway: { availabilities: { data?: any }; responsetimes: any };
  private endpoint: { availabilities: { data?: any }; responsetimes: any };
  private logs: { total: string; logs: any[]; metadata: any };
  private transitionLogs: { total: string; logs: any[]; metadata: any };
  private query: LogsQuery;

  constructor(
    private ApiService: ApiService,
    private $rootScope: IRootScopeService,
    private $q: IQService,
    private UserService: UserService,
    private $window,
    private ngRouter: Router,
  ) {
    this.gateway = { availabilities: {}, responsetimes: {} };
    this.endpoint = { availabilities: {}, responsetimes: {} };

    this.onPaginate = this.onPaginate.bind(this);
  }

  $onInit() {
    this.query = new LogsQuery();
    this.query.size = this.activatedRoute.snapshot.queryParams.size ? this.activatedRoute.snapshot.queryParams.size : 10;
    this.query.page = this.activatedRoute.snapshot.queryParams.page ? this.activatedRoute.snapshot.queryParams.page : 1;

    this.query.from = this.activatedRoute.snapshot.queryParams.from;
    this.query.to = this.activatedRoute.snapshot.queryParams.to;
    this.$window.localStorage.lastHealthCheckQuery = JSON.stringify(this.query);

    this.ApiService.get(this.activatedRoute.snapshot.params.apiId).then((api) => {
      this.api = api.data;
      this.updateChart();
    });
  }

  timeframeChange(timeframe: { from: number; to: number }) {
    this.query.from = timeframe.from;
    this.query.to = timeframe.to;
    this.updateChart();
  }

  updateChart() {
    this.ApiService.apiHealth(this.api.id, 'availability').then((response) => {
      this.endpoint.availabilities.data = response.data;
    });

    this.ApiService.apiHealth(this.api.id, 'response_time').then((response) => {
      this.endpoint.responsetimes.data = response.data;
    });

    if (this.displayGatewayHC()) {
      this.ApiService.apiHealth(this.api.id, 'availability', 'gateway').then((response) => {
        this.gateway.availabilities.data = response.data;
      });

      this.ApiService.apiHealth(this.api.id, 'response_time', 'gateway').then((response) => {
        this.gateway.responsetimes.data = response.data;
      });
    }

    this.refresh();
  }

  onPaginate(page: number) {
    this.query.page = page;
    this.refresh();
  }

  refresh() {
    this.$window.localStorage.lastHealthCheckQuery = JSON.stringify(this.query);

    this.ApiService.apiHealthLogs(this.api.id, this.query).then((logs) => {
      this.logs = logs.data;
    });
    this.ApiService.apiHealthLogs(this.api.id, assign({ transition: true }, this.query)).then((logs) => {
      this.transitionLogs = logs.data;
    });

    const from = this.query.from || moment().subtract(1, 'days').valueOf();
    const to = this.query.to || moment().valueOf();
    const interval = Math.floor((to - from) / 24);

    const promises = [
      this.ApiService.apiHealthAverage(this.api.id, {
        from: from,
        to: to,
        interval: interval,
        type: 'RESPONSE_TIME',
      }),
      this.ApiService.apiHealthAverage(this.api.id, {
        from: from,
        to: to,
        interval: interval,
        type: 'AVAILABILITY',
      }),
    ];

    this.$q.all(promises).then((responses) => {
      let i = 0;
      const series = [];
      forEach(responses, (response) => {
        const values = response.data.values;
        if (values && values.length > 0) {
          forEach(values, (value) => {
            forEach(value.buckets, (bucket) => {
              if (bucket) {
                // eslint-disable-next-line eqeqeq
                const responseTimeLine = i == 0;
                series.push({
                  name: 'Average of ' + (responseTimeLine ? 'response time' : 'availability'),
                  data: bucket.data,
                  color: responseTimeLine ? '#337AB7' : '#5CB85C',
                  type: responseTimeLine ? 'area' : 'column',
                  labelSuffix: responseTimeLine ? 'ms' : '%',
                  decimalFormat: !responseTimeLine,
                  yAxis: i,
                  zones: responseTimeLine
                    ? []
                    : [
                        {
                          value: 80,
                          color: '#D9534F',
                        },
                        {
                          value: 95,
                          color: '#F0AD4E',
                        },
                        {
                          color: '#5CB85C',
                        },
                      ],
                });
              }
            });
          });
        }
        i++;
      });
      const timestamp = responses[0] && responses[0].data && responses[0].data.timestamp;
      this.chartData = {
        plotOptions: {
          series: {
            pointStart: timestamp && timestamp.from,
            pointInterval: timestamp && timestamp.interval,
          },
        },
        series: series,
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            month: '%e. %b',
            year: '%b',
          },
        },
        yAxis: [
          {
            labels: {
              format: '{value}ms',
            },
            title: {
              text: 'Response time',
            },
          },
          {
            title: {
              text: 'Availability',
            },
            labels: {
              format: '{value}%',
            },
            max: 100,
            opposite: true,
          },
        ],
        chart: {
          events: {
            selection: (event) => {
              if (!event.resetSelection) {
                this.query.from = Math.floor(event.xAxis[0].min);
                this.query.to = Math.floor(event.xAxis[0].max);
                this.$rootScope.$broadcast('timeframeZoom', {
                  from: this.query.from,
                  to: this.query.to,
                });
                this.refresh();
              }
            },
          },
        },
      };
    });
  }

  getEndpointStatus(state: number): string {
    switch (state) {
      case 3:
        return 'UP';
      case 2:
        return 'TRANSITIONALLY_UP';
      case 1:
        return 'TRANSITIONALLY_DOWN';
      case 0:
        return 'DOWN';
      default:
        return '-';
    }
  }

  displayGatewayHC() {
    return this.UserService.currentUser.isOrganizationAdmin();
  }

  showLog(logId: string) {
    this.ngRouter.navigate(['./', logId], { relativeTo: this.activatedRoute });
  }

  goToConfigureHealthCheck() {
    this.ngRouter.navigate(['../', 'healthcheck'], { relativeTo: this.activatedRoute });
  }
}
ApiHealthcheckDashboardControllerAjs.$inject = ['ApiService', '$rootScope', '$q', 'UserService', '$window', 'ngRouter'];

export default ApiHealthcheckDashboardControllerAjs;
