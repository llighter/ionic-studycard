import { Component } from '@angular/core';

import { StatsPage } from '../stats/stats';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = StatsPage;
  tab3Root = ContactPage;

  constructor() {

  }
}
