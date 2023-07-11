import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsSidebarComponent } from './options-sidebar.component';

describe('OptionsSidebarComponent', () => {
  let component: OptionsSidebarComponent;
  let fixture: ComponentFixture<OptionsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionsSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
