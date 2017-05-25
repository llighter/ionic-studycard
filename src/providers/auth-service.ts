import { Injectable, OnInit } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';

import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';


@Injectable()
export class AuthService implements OnInit{
  private user: Observable<firebase.User>;
  private currentUser: firebase.User;

  constructor(private afAuth: AngularFireAuth
        , private platform: Platform
        , private fb: Facebook) {
    console.log('Hello AuthService Provider');
  }

  ngOnInit(): void {
    this.user = this.afAuth.authState;
    this.user.subscribe((user: firebase.User) => {
      if(user != null) {
        this.currentUser = user;
      }
    });
  }

  // TODO: In case, ngOnInit are not checking user is null,
  //      then Can I compare with 'null' not 'ndefined'?
  // TODO: In angularfire2 doc, They are use displayName:string. 
  get authenticated(): boolean {
    console.log(`[call]authenticated(): ${this.currentUser}`);
    return this.currentUser !== undefined;
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

  displayName(): string {
    if (this.currentUser !== null) {
      return this.currentUser.displayName;
    } else {
      return '';
    }
  }

}