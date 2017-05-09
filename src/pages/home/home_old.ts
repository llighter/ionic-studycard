import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: Observable<firebase.User>;
  categories: FirebaseListObservable<any[]>;
  userName: string;

  constructor(public navCtrl: NavController
        , public alertCtrl: AlertController
        , private afAuth: AngularFireAuth
        , private db: AngularFireDatabase) {
    
    this.user = afAuth.authState;
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

  // TODO : Clear User related data.
  logout(): void {
     this.afAuth.auth.signOut();
  }

  addCategory(category: string): void {
    this.categories.push(category);
  }

  // TODO : apply category type
  deleteCategory(category: string): void {
    this.categories.remove(category);
  }

  showPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'New Category',
      message: "Enter a name for this new category you're so want to make",
      inputs: [
        {
          name: 'categoryName',
          placeholder: 'Category Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.categories.push(data);
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }
}

