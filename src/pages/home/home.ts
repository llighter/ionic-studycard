import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: Observable<firebase.User>;
  items: FirebaseListObservable<any[]>;
  categories: FirebaseListObservable<any[]>;
  userName: string;

  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, private db: AngularFireDatabase) {
    this.user = afAuth.authState;
    this.items = db.list('items');

    this.user.subscribe((user: firebase.User) => {
      if(user != null) {
        this.userName = user.displayName;
        this.categories = this.db.list(user.uid);
        this.categories.subscribe(categories => console.log(`[Categories]${categories}`));
        console.log(`[constructor]userName : ${this.userName}`);
      } else {
        this.userName = 'Not yet Logged in..';
      }
    });
  }

  login(): void {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout(): void {
     this.afAuth.auth.signOut();
  }

  addCategory(category: string): void {
    this.categories.push(category);
  }

}
