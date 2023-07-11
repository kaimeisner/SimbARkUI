import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientenaufkommenComponent } from './patientenaufkommen.component';

describe('PatientenaufkommenComponent', () => {
  let component: PatientenaufkommenComponent;
  let fixture: ComponentFixture<PatientenaufkommenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientenaufkommenComponent]
    });
    fixture = TestBed.createComponent(PatientenaufkommenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
