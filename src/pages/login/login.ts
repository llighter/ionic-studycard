import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { TabsPage }  from '../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  constructor(public navCtrl: NavController
        , public navParams: NavParams
        , private _auth: AuthService) {
  }

  signInWithFacebook() {
    this._auth.signInWithFacebook()
      .then((res) => {
        this.navCtrl.setRoot(TabsPage);
      });
  }
  
  signin() {
    this._auth.signin();
  }

  signout() {
    this._auth.signout();
  }
}
