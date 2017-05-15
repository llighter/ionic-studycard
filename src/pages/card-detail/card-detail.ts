import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CardDTO } from '../../core/card-dto';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

/**
 * Generated class for the CardDetail page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-card-detail',
  templateUrl: 'card-detail.html',
})
export class CardDetail implements OnInit{
  categoryTitle: string;
  card: CardDTO;
  user: Observable<firebase.User>;
  uid: string;

  constructor(public navCtrl: NavController
          , public navParams: NavParams
          , private db: AngularFireDatabase
          , private afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {
    console.log(`[card-detail]${JSON.stringify(this.navParams)}`);
    this.categoryTitle = this.navParams.get('categoryName');

    this.user = this.afAuth.authState;
    this.user.subscribe((user: firebase.User) => {
      if(user != null) {
        this.uid = user.uid;
      }
    });
  }

  insert(question:string, answer:string, source:string) {
    this.card.question = question;
    this.card.answer = answer;
    this.card.source = source;
    this.card.failCount = 0;

    this.db.list(`${this.uid}/categories/${this.categoryTitle}`).push(this.card);
    
  }

}
