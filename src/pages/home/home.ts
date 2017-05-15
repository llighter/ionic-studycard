import { Component, OnInit } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import { NavController, AlertController, Platform } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { CardDetail } from '../card-detail/card-detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit{
  pushPage: any;

  user: Observable<firebase.User>;
  categories: FirebaseListObservable<any[]>;
  userName: string;
  // rootRef: firebase.database.Reference;

  constructor(public navCtrl: NavController
        , public alertCtrl: AlertController
        , private afAuth: AngularFireAuth
        , private db: AngularFireDatabase
        , private fb: Facebook
        , private platform: Platform) {
  }

  ngOnInit(): void {
    this.pushPage = CardDetail;

    this.user = this.afAuth.authState;
    this.user.subscribe((user: firebase.User) => {
      if(user != null) {
        this.userName = user.displayName;
        this.categories = this.db.list(`${user.uid}/cetegories`);
        console.log(`[constructor]userName : ${this.userName}`);
      } else {
        this.userName = 'Not yet Logged in..';
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

  // TODO : Clear User related data.
  signout(): void {
     this.afAuth.auth.signOut();
     this.categories = null;
  }

  // TODO : apply category type
  deleteCategory(category: string): void {
    this.categories.remove(category);
  }

  addCategory(): void {
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
            this.db.database.ref(data.displayName);
            this.categories.push(data);
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }
}

