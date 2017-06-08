import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CardDTO } from '../../core/card-dto';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase/app';


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
  currentSegment: string;

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

    this.currentSegment = "stage1";
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

        this.updateStageCount();
      }
    });
  }

  updateStageCount(): void {
    this.stageCount.forEach((stage, index) => {
      this.db.list(`${this.uid}/${this.categoryTitle}`, {
        query: {
          orderByChild: 'stage',
          equalTo: index+1,
        }
      }).subscribe(list => this.stageCount[index] = list.length);
    });
  }

  insert(data:any) {
    if(!this.isStageFull(1)) {
      this.card.question = data.question;
      this.card.answer = data.answer;
      this.card.source = data.source;
      this.card.failCount = 0;
      this.card.stage = 1;

      this.db.list(`${this.uid}/${this.categoryTitle}`).push(this.card);
    } else {
      console.log(`[x]Can't insert card into stage1.. It is now Full...`);
      let alert = this.alertCtrl.create({
        title: 'First Stage is now Full!',
        subTitle: `Can't insert card into stage1.. It is now Full...`,
        buttons: ['OK']
      });
      alert.present();
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
      if(!this.isStageFull(++card.stage)) {
        card.failCount = 0;
        this.queryObservable.push(card);
        this.queryObservable.remove(key);
      } else {
        let alert = this.alertCtrl.create({
          title: 'Second Stage is now Full!',
          subTitle: `Can't insert card into stage2.. It is now Full...`,
          buttons: ['OK']
        });
        alert.present();
      }
      
    }
    // TODO: (개선)카드 앞면으로 초기화
    this.show = true;
  }

  fail(key:string, card: CardDTO) {

    card.failCount++;

    // TODO: 1단계 스테이지가 가득 찾는지 확인해야한다.
    if(this.isStageFull(1) && card.stage != 1) {
      let alert = this.alertCtrl.create({
        title: 'First Stage is now Full!',
        subTitle: `Can't move card into stage1.. Need to Clear your stage1...`,
        buttons: ['OK']
      });
      alert.present();
    } else {
      card.stage = 1;
      this.queryObservable.remove(key);
      this.queryObservable.push(card);
    }

    // TODO: (개선)카드 앞면으로 초기화
    this.show = true;
  }

  drop(key:string, card: CardDTO) {
    console.log(`[drop-card]${key}`);
    this.queryObservable.remove(key);
  }

  filterBy(stage: string) {
    this.stageSubject.next(stage);
    console.log(`[Current-Stage]${this.stageSubject.getValue()}`);
  }
  
  isStageFull(level): boolean {
    let isFull: boolean = false;
    console.log(`[stage-count]${this.stageCount}`);

    switch(level) {
      case 1:
        isFull = this.stageCount[0] == 30 ? true : false;
        break;
      case 2:
        isFull = this.stageCount[1] == 30*2 ? true : false;
        break;
      case 3:
        isFull = this.stageCount[2] == 30*5 ? true : false;
        break;
      case 4:
        isFull = this.stageCount[3] == 30*8 ? true : false;
        break;
      case 5:
        isFull = this.stageCount[4] == 30*15 ? true : false;
        break;
    }

    return isFull;
  }

}
