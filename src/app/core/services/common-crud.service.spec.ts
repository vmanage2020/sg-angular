import { TestBed } from '@angular/core/testing';

import { CommonCrudService } from './common-crud.service';

describe('CommonCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommonCrudService = TestBed.get(CommonCrudService);
    expect(service).toBeTruthy();
  });
});
