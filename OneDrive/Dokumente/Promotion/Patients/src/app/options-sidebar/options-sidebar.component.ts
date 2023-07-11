import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DayOfWeekService } from '../services/day-of-week.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-options-sidebar',
  templateUrl: './options-sidebar.component.html',
  styleUrls: ['./options-sidebar.component.css']
})
export class OptionsSidebarComponent implements OnInit {

  constructor(
    private dayOfWeekService: DayOfWeekService,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.route.params.subscribe(params => {
      this.dayOfWeekService.setDayOfWeek(params['id']); //Should set the route to the given id in the URL. Does not work
      this.updateDay();
    });
  }

  ngOnInit(): void {
    let id = this.dayOfWeekService.getDayOfWeek();
    let zoneID = this.cookieService.get("marked");
    this.router.navigate(['chart', { id: id, zoneID: zoneID }]);
  }

  @Output() callParent: EventEmitter<void> = new EventEmitter();

  dayOfWeek = this.dayOfWeekService.getDayOfWeek();
  maxDays = this.dayOfWeekService.getMaxDays();

  private updateDay(): void {
    this.dayOfWeek = this.dayOfWeekService.getDayOfWeek();
  }

  onDec(): void {
    this.decDay();
    let id = this.dayOfWeek;
    let zoneID = this.cookieService.get("marked");
    this.router.navigate(['chart', { id: id , zoneID: zoneID}]);

    this.callParent.emit();
  }

  onInc(): void {
    this.incDay();
    let id = this.dayOfWeek;
    let zoneID = this.cookieService.get("marked");
    this.router.navigate(['chart', { id: id , zoneID: zoneID}]);

    this.callParent.emit();
  }

  private incDay(): void {
    this.dayOfWeekService.increaseDay();
    this.updateDay();
  }

  private decDay(): void {
    this.dayOfWeekService.decreaseDay();
    this.updateDay();
  }

}
