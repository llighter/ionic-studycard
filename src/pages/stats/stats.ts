import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { multi } from './data';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  single: any[];
  multi: any[];

  view: any[] = [300, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'The number of Card';
  showYAxisLabel = false;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;

  constructor(public navCtrl: NavController) {
    Object.assign(this, {multi})
  }

  onSelect(event) {
    console.log(event);
  }

}
