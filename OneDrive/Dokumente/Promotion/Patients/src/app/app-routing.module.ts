import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { AreasComponent } from './areas/areas.component';
import { SelectComponent } from './select/select.component';
import { PatientenaufkommenComponent } from './patientenaufkommen/patientenaufkommen.component';
import { PatientenaufkommenmenuComponent } from './patientenaufkommenmenu/patientenaufkommenmenu.component';



const routes: Routes = [
  { path: '', redirectTo: 'select', pathMatch: 'full'},
  { path: 'chart', component: BarChartComponent},
  {path:'areas',component:AreasComponent},
  {path:'select',component:SelectComponent},
  {path:'patientenaufkommenkoordination',component:PatientenaufkommenmenuComponent},
  {path:'patientenaufkommen',component:PatientenaufkommenComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
