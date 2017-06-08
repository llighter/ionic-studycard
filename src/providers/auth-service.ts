import { Injectable } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';

import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';


@Injectable()
export class AuthService {
  // private user: Observable<firebase.User>;

  private displayName: string;

  constructor(private afAuth: AngularFireAuth
        , private platform: Platform
        , private fb: Facebook) {
    this.afAuth.authState.subscribe((user: firebase.User) => {
      if(user != null) {
        this.displayName = user.displayName;
      } else {
        this.displayName = 'Not Logged in..';
      }
    });
  }

  signin(): void {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signInWithFacebook() {
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential);
      })
    }
    else {
      return this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(res => console.log(res));
    }
  }

  // TODO: Set RootPage to Login
  signout(): void {
    this.afAuth.auth.signOut();
  }


}