import { Injectable } from '@angular/core';
import { max } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DayOfWeekService {

  constructor() { }

  private zoneID: number = 0;
  private dayOfWeek: number = 1;
  private maxDays: number = 7;

  increaseDay(): void {
    if (this.dayOfWeek < this.maxDays) {
      this.dayOfWeek += 1;
    }
  }

  setDayOfWeek(day: any) {
    console.log.apply(day);
    if (Number.isFinite(day) && day <= this.maxDays && day > 0) {
      this.dayOfWeek = day;
    }
  }

  setZoneID(newID: number) {
    this.zoneID = newID;
  }

  decreaseDay(): void {
    if (this.dayOfWeek > 1) {
      this.dayOfWeek -= 1;
    }
  }

  getDayOfWeek(): number {
    return this.dayOfWeek;
  }

  getMaxDays(): number {
    return this.maxDays;
  }

  getZoneID(): number {
    return this.zoneID;
  }
}
