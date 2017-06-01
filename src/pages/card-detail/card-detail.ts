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
  stageCount: number[] = [0,0,0,0,0];

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

        // TODO: This is the Best way? Come on man...
        // option : use function
        this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: 1,
          }
        }).subscribe(list => this.stageCount[0] = list.length);
        this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: 2,
          }
        }).subscribe(list => this.stageCount[1] = list.length);
        this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: 3,
          }
        }).subscribe(list => this.stageCount[2] = list.length);
        this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: 4,
          }
        }).subscribe(list => this.stageCount[3] = list.length);
        this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: 5,
          }
        }).subscribe(list => this.stageCount[4] = list.length);
      }
    });
  }

  insert(data:any) {
    if(!this.isStageFull()) {
      this.card.question = data.question;
      this.card.answer = data.answer;
      this.card.source = data.source;
      this.card.failCount = 0;
      this.card.stage = 1;

      this.db.list(`${this.uid}/${this.categoryTitle}`).push(this.card);
    } else {
      console.log(`[x]Can't insert card into stage1.. It is now Full...`);
    }
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
    
    // TODO: (개선)카드 앞면으로 초기화
    this.show = true;
  }

  fail(key:string, card: CardDTO) {

    console.log(`[fail-stage]${card.stage}`);
    card.stage = 1;

  
    // TODO: 1단계 스테이지가 가득 찾는지 확인해야한다.
    if(!this.isStageFull) {
      alert("[x]1st stage is full...");
    }

    this.queryObservable.remove(key);
    this.queryObservable.push(card);

    // TODO: (개선)카드 앞면으로 초기화
    this.show = true;
  }

  drop(key:string, card: CardDTO) {

    console.log(`[drop-card]${key}`);

    this.queryObservable.remove(key);
  }

  filterBy(stage: string) {
    // How can I know the value inside subject ?
    // this.stageSubject.next(stage);
    this.stageSubject.next(stage);

    console.log(`[Stage]${this.stageSubject.getValue()}`);
  }
  
  isStageFull(): boolean {
    let isFull: boolean;
    console.log(`[stage-count]${this.stageCount}`);

    isFull = this.stageCount[0] == 30 ? true : false;

    return isFull;
  }

}
