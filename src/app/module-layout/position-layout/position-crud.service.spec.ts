import { TestBed } from '@angular/core/testing';

import { PositionCrudService } from './position-crud.service';

describe('PositionCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PositionCrudService = TestBed.get(PositionCrudService);
    expect(service).toBeTruthy();
  });
});
