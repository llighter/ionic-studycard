import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CardDTO } from '../../core/card-dto';
import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
  user: Observable<firebase.User>;
  uid: string;
  show: boolean = true;

  card: CardDTO;
  queryObservable: FirebaseListObservable<any[]>;
  stageSubject: BehaviorSubject<any>;

  constructor(public navCtrl: NavController
          , public navParams: NavParams
          , public alertCtrl: AlertController
          , private db: AngularFireDatabase
          , private afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {
    console.log(`[card-detail]${JSON.stringify(this.navParams)}`);
    this.categoryTitle = this.navParams.get('categoryName');

    this.card = new CardDTO();
    this.stageSubject = new BehaviorSubject(1);

    this.user = this.afAuth.authState;
    this.user.subscribe((user: firebase.User) => {
      if(user != null) {
        this.uid = user.uid;

        this.queryObservable = this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: this.stageSubject,
            limitToFirst: 1,
          }
        });

      }
    });
  }

  insert(data:any) {
    this.card.question = data.question;
    this.card.answer = data.answer;
    this.card.source = data.source;
    this.card.failCount = 0;
    this.card.stage = 1;

    this.db.list(`${this.uid}/${this.categoryTitle}`).push(this.card);
  }

  addCard(): void {
    let prompt = this.alertCtrl.create({
      title: 'New Card',
      message: "Enter a name for this new category you're so want to make",
      inputs: [
        {
          name: 'question',
          placeholder: 'question'
        },
        {
          name: 'answer',
          placeholder: 'answer'
        },
        {
          name: 'source',
          placeholder: 'source'
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
            this.insert(data);
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }

  success(key:string, card: CardDTO) {

    if(card.stage >= 1 && card.stage < 5) {
      card.stage++;
      console.log(`[success-stage]${card.stage}`);
      this.queryObservable.push(card);
    } 

    this.queryObservable.remove(key);
  }

  fail(key:string, card: CardDTO) {

    console.log(`[fail-stage]${card.stage}`);
    card.stage = 1;

    this.queryObservable.remove(key);
    this.queryObservable.push(card);
  }

  drop(key:string, card: CardDTO) {

    console.log(`[drop-card]${key}`);

    this.queryObservable.remove(key);
  }

  filterBy(stage: string) {
    // TODO: How can I know the value inside subject ?
    // this.stageSubject.next(stage);
    this.stageSubject.next(stage);

    console.log(`[Stage]${this.stageSubject.getValue()}`);
  }

}
