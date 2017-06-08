import { Component, OnInit } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import { NavController, AlertController, Platform } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { CardDetail } from '../card-detail/card-detail';
import { CategoryDTO } from '../../core/category-dto';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit{
  pushPage: any;

  user: Observable<firebase.User>;
  categories: FirebaseListObservable<any[]>;
  userName: string;
  uid: string;
  categotyDTO: CategoryDTO;
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
      this.uid = user.uid;
      this.userName = user.displayName;
      this.categories = this.db.list(`${user.uid}/cetegories`);
      // if(user != null) {
      //   this.uid = user.uid;
      //   this.userName = user.displayName;
      //   this.categories = this.db.list(`${user.uid}/cetegories`);
      // } else {
      //   this.userName = 'Not yet Logged in..';
      // }
    });
  }
  
  deleteCategory(key: string, category: CategoryDTO): void {
    this.categories.remove(key);
    this.db.list(`${this.uid}/${category.categoryName}`).remove();
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

