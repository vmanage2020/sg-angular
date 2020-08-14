import { TestBed } from '@angular/core/testing';

import { SportsCrudService } from './sports-crud.service';

describe('SportsCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SportsCrudService = TestBed.get(SportsCrudService);
    expect(service).toBeTruthy();
  });
});
