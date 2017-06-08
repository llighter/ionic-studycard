import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';

import { TabsPage } from '../pages/tabs/tabs';
import { Login } from '../pages/login/login';
import { AuthService } from '../providers/auth-service';

import * as firebase from 'firebase/app';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform
          , statusBar: StatusBar
          , splashScreen: SplashScreen
          , private _auth: AuthService
          , private afAuth: AngularFireAuth) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.afAuth.authState.subscribe((user: firebase.User) => {
      if(!user) {
        this.rootPage = Login;
      } else {
        this.rootPage = TabsPage;
      }
    });
  }
}
