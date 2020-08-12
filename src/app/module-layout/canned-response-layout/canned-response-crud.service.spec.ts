import { TestBed } from '@angular/core/testing';

import { CannedResponseCrudService } from './canned-response-crud.service';

describe('CannedResponseCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CannedResponseCrudService = TestBed.get(CannedResponseCrudService);
    expect(service).toBeTruthy();
  });
});
