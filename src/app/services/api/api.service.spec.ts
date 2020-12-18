import { TestBed } from '@angular/core/testing';

import { API } from './api.service';

describe('ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: API = TestBed.get(API);
    expect(service).toBeTruthy();
  });
});
