import { TestBed } from '@angular/core/testing';

import { SeasonCrudService } from './season-crud.service';

describe('SeasonCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SeasonCrudService = TestBed.get(SeasonCrudService);
    expect(service).toBeTruthy();
  });
});
