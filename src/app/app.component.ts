import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { Login } from '../pages/login/login';
import { AuthService } from '../providers/auth-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform
          , statusBar: StatusBar
          , splashScreen: SplashScreen
          , _auth: AuthService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    if(_auth.authenticated) {
      console.log("[test1]"+_auth.authenticated);
      this.rootPage = TabsPage;
    } else {
      console.log("[test2]"+_auth.authenticated);
      this.rootPage = Login;
    }

  }
}
