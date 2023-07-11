import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { HttpService } from '../services/http.service';
import { Aufkommen } from '../interfaces/aufkommenInterface';
import { DayOfWeekService } from '../services/day-of-week.service';
import { CookieService } from 'ngx-cookie-service';
import {MenuHelper} from './../menu/MenuHelper';
import {Area} from './../areas/Area';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit, OnDestroy {

  areas:Array<Area> = [];
  response:any;
  template:String = "";

  private selectedBars: number[] = [];
  selectAllChecked = false;

  public sliderValue = 6;
  public chart: any;
  private timeData: string[] = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
  private yDataArr = new Array<number>(47);

  private template1: number[] = [2, 1, 3, 4, 11, 12, 18, 15, 9, 10, 7, 6, 2, 2, 1, 3, 4, 2, 1, 3, 2, 2, 1, 3, 4, 2, 1, 3, 2, 2, 1, 3, 4,
    2, 1, 3, 2, 2, 1, 3, 4, 2, 1, 3, 2, 2, 1, 3];
  private template2: number[] = [2, 1, 3, 4, 2, 9, 5, 6, 9, 6, 1, 3, 2, 2, 1, 3, 4, 2, 1, 3, 2, 2, 1, 3, 4, 8, 12, 7, 2, 2, 1, 3, 4, 2,
    1, 3, 2, 2, 1, 3, 4, 6, 10, 13, 22, 16, 11, 7];
  private template3: number[] = [2, 1, 3, 4, 2, 8, 13, 9, 4, 2, 1, 3, 2, 2, 1, 3, 4, 2, 1, 3, 2, 5, 8, 13, 14, 22, 14, 13, 9, 6, 5, 3, 4,
    2, 1, 3, 2, 2, 1, 3, 4, 2, 1, 3, 2, 2, 1, 3];
  private template4: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private chartTypeSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private httpService: HttpService,
    private dayOfWeekService: DayOfWeekService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    MenuHelper.setMenu(document, ["Zonen", "TemplateZonen", "ZonenAufbau"]);
    MenuHelper.setTemplateZonen(true);
    MenuHelper.setZonenAufbau(true);
    MenuHelper.setPatientenaufkommen(true);
    this.updateChart(this.cookieService.get("marked"));
    this.loadTemplate()
  }

  ngOnDestroy(): void {
    this.chartTypeSubscription.unsubscribe();
  }

  updateCharts(){
    this.updateChart(this.cookieService.get("marked"));
  }

  updateChart(zoneID:String): void {
    console.log("updating chart " + this.dayOfWeekService.getDayOfWeek());

    /** Holen der Daten der Datenbank vom Backend */
    this.httpService.getData('http://localhost:8080/api/v1/aufkommen?zoneID='+zoneID).subscribe(
      (data: Aufkommen) => {
        console.log(zoneID);
        /** Aufnehmen der Daten in einen lokalen Array */
        this.yDataArr = [];

        let y = 0;

        for (var i = 0; i < data.length; i++) {
          if (/*this.cookieService.get("marked") == data[i].zoneID + "" && */data[i].uhrzeit >= (this.dayOfWeekService.getDayOfWeek() - 1) * 48 && data[i].uhrzeit < this.dayOfWeekService.getDayOfWeek() * 48) {
            this.yDataArr[y] = data[i].wert;
            y++;
          }
        }
        /** Erstellen des Diagramms */
        this.createChart();

    },
    (error) => {
      console.error(error);
    });
  }

  /** Zuweisen der Attribute für das Diagramm */
  createChart() {

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart("Chart", {
      type: 'bar',  //bar or line

      data: {// values on X-Axis
        labels: this.timeData,
        datasets: [
          {
            label: "Patientenaufkommen",
            data: this.yDataArr,
            backgroundColor: 'orange'
          }
        ]
      },
      options: {
        aspectRatio: 3,
        scales: {
          y: {
            max: this.getMax(this.yDataArr),
            ticks: {
              callback: value => `${value} %`
            }
          }
        },
        responsive: true,
        onClick: this.onChartClick.bind(this)
      }

    });
  }

  /** Commit Daten aus Diagramm ins Backend */
  commit() {
      for(let i = 0; i < this.areas.length;i++){
        this.areas[i].patientenaufkommen = +this.cookieService.get("marked");
        this.saveArea(this.areas[i]);
      }
      this.httpService.postData('http://localhost:8080/api/v1/aufkommen', this.yDataToAufkommen(this.yDataArr)).subscribe(
      (data) => {
        console.log("commiting data to database" + data);
      },
      (error) => {
        console.error(error);
      });
  }

  /** yData umwandeln in Aufkommen für das Backend */
  yDataToAufkommen(arr: Array<any>): any {
    let data = [];

    for (var i = 0; i < arr.length; i++) {
      var obj = {
        uhrzeit: i + (this.dayOfWeekService.getDayOfWeek() - 1) * 48,
        wert: arr[i],
        zoneID: this.cookieService.get("marked")
      }
      data.push(obj);
    }
    let retJSON = JSON.stringify(data);
    console.log(retJSON);
    return retJSON;
  }

  /** Ermitteln des maximalen Wertes des Diagramms, um die Größe entsprechend anzupassen */
  getMax(arr: number[]): number {
    if (!arr) {
      return 0;
    }
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < arr.length; i++) {
      const val = +arr[i]; // convert to number
      if (!isNaN(val) && val > max) {
        max = val;
      }
    }
    if (max > 96)
      max = 100;
    else
      max += 4;
    return max;
  }

  /** Ermöglichen des Veränderns von Werten über einen Slider */
  onSliderChange(event: any) {
    /*this.sliderValue = event.value;
    let e = document.getElementById('timeStamp') as HTMLSelectElement;

    if (e != null && e.value != "minValue") {
      this.yDataArr[Number(e.value)] = event.value;
    }

    if (e != null && e.value == "minValue") {
      for (let i = 0; i < this.yDataArr.length; i++) {
        this.yDataArr[i] = event.value;
      }
    }*/

    this.sliderValue = event.value;

    if (this.selectedBars.length > 0) {
      for (let i = 0; i < this.selectedBars.length; i++) {
        this.yDataArr[this.selectedBars[i]] = this.sliderValue;
      }
    }

    this.chart.data.datasets[0].data = this.yDataArr;
    this.chart.options.scales.y.max = this.getMax(this.yDataArr);
    this.chart.update();
  }

  /** Ermöglicht Live-Updates der Werte durch verändern des Sliders */
  onInputChange(event: any) {

    this.sliderValue = event;

    if (this.selectedBars.length > 0) {
      for (let i = 0; i < this.selectedBars.length; i++) {
        this.yDataArr[this.selectedBars[i]] = this.sliderValue;
      }
    }

    this.chart.data.datasets[0].data = this.yDataArr;
    this.chart.options.scales.y.max = this.getMax(this.yDataArr);
    this.chart.update();
  }

  /** Einsetzen von Werten aus festgelegten Templates */
  setTemplate(template: number) {
    if (template == 1) {
      this.chart.data.datasets[0].data = this.template1;
      this.chart.options.scales.y.max = this.getMax(this.template1);
      this.yDataArr = this.template1;
    }
    else if (template == 2) {
      this.chart.data.datasets[0].data = this.template2;
      this.chart.options.scales.y.max = this.getMax(this.template2);
      this.yDataArr = this.template2;
    }
    else if (template == 3) {
      this.chart.data.datasets[0].data = this.template3;
      this.chart.options.scales.y.max = this.getMax(this.template3);
      this.yDataArr = this.template3;
    }
    else if (template == 4) {
      this.chart.data.datasets[0].data = this.template4;
      this.chart.options.scales.y.max = this.getMax(this.template4);
      this.yDataArr = this.template4;
    }

    this.chart.update();
  }

  /** Überschreiben eines bestehenden Templates */
  saveTemplate() {
    this.template4 = this.chart.data.datasets[0].data;
  }

  onChartClick(event: any, chartElements: any[]): void {
    const chart = event.chart;
    const elements = chart.getElementsAtEventForMode(event.native, 'index', { intersect: true }, true);

    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index;
      const index = this.selectedBars.indexOf(clickedElementIndex);

      if (index > -1) {
        // Remove from selection
        this.selectedBars.splice(index, 1);
      } else {
        // Add to selection
        this.selectedBars.push(clickedElementIndex);
      }
    } else {
      // Clear selection when clicking outside bars
      this.selectedBars = [];
    }

    // Update the color of the bars
    const dataset = chart.data.datasets[0];
    const backgroundColors = [];

    if (event.native.type === 'mousedown') {
      // Mouse button is pressed down (start of selection)
      this.selectedBars = [];
    } else if (event.native.type === 'mouseup') {
      // Mouse button is released (end of selection)
      // Perform any action you want with the selected bars
      console.log('Selected bars:', this.selectedBars);
    } else if (event.native.type === 'mousemove') {
      // Mouse is moving (during selection)
      if (elements.length > 0) {
        const clickedElementIndex = elements[0].index;
        const index = this.selectedBars.indexOf(clickedElementIndex);

        if (index === -1) {
          // Add to selection if not already selected
          this.selectedBars.push(clickedElementIndex);
        }
      }
    }

    for (let i = 0; i < dataset.data.length; i++) {
      if (this.selectedBars.includes(i)) {
        // Darker tone for selected bars
        backgroundColors.push('rgba(202, 131, 0, 1)');
      } else {
        // Default color for unselected bars
        backgroundColors.push('rgba(255, 165, 0, 1)');
      }
    }

    dataset.backgroundColor = backgroundColors;
    chart.update();

    // Perform desired logic with the selected bars
    console.log(this.selectedBars);
  }

  onSelectAllChange(): void {
    if (this.selectAllChecked) {
      // Select all bars
      this.selectedBars = Array.from({ length: this.yDataArr.length }, (_, i) => i);
    } else {
      // Deselect all bars
      this.selectedBars = [];
    }

    // Update the color of the bars
    const chart = this.chart;
    const dataset = chart.data.datasets[0];
    const backgroundColors = [];

    for (let i = 0; i < dataset.data.length; i++) {
      if (this.selectedBars.includes(i)) {
        // Darker tone for selected bars
        backgroundColors.push('rgba(202, 131, 0, 1)');
      } else {
        // Default color for unselected bars
        backgroundColors.push('rgba(255, 165, 0, 1)');
      }
    }

    dataset.backgroundColor = backgroundColors;
    chart.update();

    // Perform desired logic with the selected bars
    console.log(this.selectedBars);
  }

   private loadTemplate(){
      this.template = this.cookieService.get("template");
      let ids = this.cookieService.get("marked").split(",");

      this.http.get('http://localhost:8080/getTemplate?template='+this.template).subscribe(data =>{
          let arr = <Array<Area>>data;
          for(let i = 0; i < arr.length; i++){
            if(ids.includes(""+arr[i].id)){
                let area = new Area(arr[i].x1, arr[i].x2, arr[i].y1, arr[i].y2, arr[i].template, arr[i].name, arr[i].soldiers, arr[i].patientenaufkommen);
                area.id = arr[i].id;
                this.areas.push(area);
            }
          }
      });
   }

   private saveArea(area: Area){
     this.http.get('http://localhost:8080/add?id='+area.id+'&x1='+area.x1+'&x2='+area.x2+'&y1='+area.y1+'&y2='+area.y2+'&template='+this.template+'&name='+area.name+'&soldiers='+area.soldiers+'&patientenaufkommen='+area.patientenaufkommen).subscribe(data =>{this.response = data;
           });
       return area;
   }

}
