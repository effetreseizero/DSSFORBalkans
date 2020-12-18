import { TestBed } from '@angular/core/testing';

import { DataStoreService } from './datastore.service';

describe('DatastoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataStoreService = TestBed.get(DataStoreService);
    expect(service).toBeTruthy();
  });
});
