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
import { Component, ElementRef, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AsyncValidator,
  AsyncValidatorFn,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_ASYNC_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { isEmpty } from 'lodash';
import { filter, map, observeOn, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { FocusMonitor } from '@angular/cdk/a11y';
import { asyncScheduler, Observable, of, Subject, timer } from 'rxjs';

import { TcpHost } from '../../../../../entities/management-api-v2/api/v4/tcpHost';
import { ApiV2Service } from '../../../../../services-ngx/api-v2.service';

/**
 * According to {@link https://www.rfc-editor.org/rfc/rfc1123} and {@link https://www.rfc-editor.org/rfc/rfc952}
 * - hostname label can contain lowercase, uppercase and digits characters.
 * - hostname label can contain dash or underscores, but not starts or ends with these characters
 * - each hostname label must have a max length of 63 characters
 */
const HOST_PATTERN_REGEX = new RegExp(
  /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-_]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-_]{0,61}[a-zA-Z0-9]))*$/,
);

@Component({
  selector: 'gio-form-listeners-tcp-hosts',
  templateUrl: './gio-form-listeners-tcp-hosts.component.html',
  styleUrls: ['../gio-form-listeners.common.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GioFormListenersTcpHostsComponent),
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => GioFormListenersTcpHostsComponent),
      multi: true,
    },
  ],
})
export class GioFormListenersTcpHostsComponent implements OnInit, OnDestroy, ControlValueAccessor, AsyncValidator {
  @Input()
  public apiId?: string;

  public listeners: TcpHost[] = [];
  public mainForm: FormGroup;
  public listenerFormArray: FormArray;
  public isDisabled = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  protected _onChange: (_listeners: TcpHost[] | null) => void = () => ({});

  protected _onTouched: () => void = () => ({});

  constructor(private readonly fm: FocusMonitor, private readonly elRef: ElementRef, private readonly apiV2Service: ApiV2Service) {
    this.listenerFormArray = new FormArray([this.newListenerFormGroup({})], { validators: [this.listenersValidator()] });
    this.mainForm = new FormGroup({
      listeners: this.listenerFormArray,
    });
  }

  ngOnInit(): void {
    this.listenerFormArray?.valueChanges
      .pipe(
        tap((listeners) => listeners.length > 0 && this._onChange(listeners)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    this.fm
      .monitor(this.elRef.nativeElement, true)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this._onTouched();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }

  // From ControlValueAccessor interface
  public writeValue(listeners: TcpHost[] | null = []): void {
    if (!listeners || isEmpty(listeners)) {
      return;
    }

    this.listeners = listeners;
    this.initForm();
  }

  // From ControlValueAccessor interface
  public registerOnChange(fn: (listeners: TcpHost[] | null) => void): void {
    this._onChange = fn;
  }

  // From ControlValueAccessor interface
  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // From ControlValueAccessor interface
  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;

    isDisabled ? this.mainForm?.disable() : this.mainForm?.enable();
  }

  public onDelete(hostIndex: number): void {
    this.listenerFormArray.removeAt(hostIndex);
    this._onTouched();
  }

  private initForm(): void {
    // Clear all previous hosts
    this.listenerFormArray.clear();

    // Populate hosts array from hosts
    this.listeners.forEach((listener) => {
      this.listenerFormArray.push(this.newListenerFormGroup(listener), {
        emitEvent: false,
      });
    });
    this.listenerFormArray.updateValueAndValidity();
  }

  public addEmptyListener() {
    this.listenerFormArray.push(this.newListenerFormGroup({}), { emitEvent: true });
  }

  public newListenerFormGroup(listener: TcpHost) {
    return new FormGroup({
      host: new FormControl(listener.host || '', {
        validators: [this.validateGenericHostListenerControl()],
        asyncValidators: [this.listenersAsyncValidator()],
      }),
    });
  }

  public validate(): Observable<ValidationErrors | null> {
    return this.listenerFormArray.statusChanges.pipe(
      observeOn(asyncScheduler),
      startWith(this.listenerFormArray.status),
      filter(() => !this.listenerFormArray.pending),
      map(() => (this.listenerFormArray.valid ? null : { invalid: true })),
      take(1),
    );
  }

  protected getValue(): TcpHost[] {
    return this.listenerFormArray?.controls.map((control) => {
      return { host: control.get('host').value };
    });
  }

  private listenersValidator(): ValidatorFn {
    return (formArray: FormArray): ValidationErrors | null => {
      const listenerFormArrayControls = formArray.controls;
      const listenerValues: string[] = listenerFormArrayControls.map((listener) => listener.value?.host);

      if (new Set(listenerValues).size !== listenerValues.length) {
        return { host: 'Duplicated hosts not allowed' };
      }
      return null;
    };
  }

  private validateGenericHostListenerControl(): ValidatorFn {
    return (formControl: FormControl): ValidationErrors | null => {
      const host = formControl.value || '';
      if (isEmpty(host.trim())) {
        return { required: 'Host is required.' };
      }
      if (host.length > 255) {
        return { max: 'Max length is 255 characters' };
      }
      if (!HOST_PATTERN_REGEX.test(host)) {
        return { format: 'Host is not valid' };
      }
      return null;
    };
  }

  private listenersAsyncValidator(): AsyncValidatorFn {
    return (formControl: FormControl): Observable<ValidationErrors | null> => {
      if (formControl && formControl.dirty) {
        return timer(250).pipe(
          switchMap(() => this.apiV2Service.verifyHosts(this.apiId, [formControl.value])),
          map((res) => (res.ok ? null : { listeners: res.reason })),
        );
      }
      return of(null);
    };
  }
}
