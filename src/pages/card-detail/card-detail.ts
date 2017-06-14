import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CardDTO } from '../../core/card-dto';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase/app';


@IonicPage()
@Component({
  selector: 'page-card-detail',
  templateUrl: 'card-detail.html',
})
export class CardDetail implements OnInit{
  categoryTitle: string;
  // user: Observable<firebase.User>;
  uid: string;
  show: boolean = true;
  stageCount: number[] = [0,0,0,0,0,0];
  currentSegment: string;

  card: CardDTO;
  queryObservable: FirebaseListObservable<any[]>;
  reservedStageObservable: FirebaseListObservable<any[]>;
  fillCountSubject: BehaviorSubject<any>;
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
    this.fillCountSubject = new BehaviorSubject(0);
    this.stageSubject = new BehaviorSubject(1);

    // this.user = this.afAuth.authState;
    this.afAuth.authState.subscribe((user: firebase.User) => {
      if(user != null) {
        this.uid = user.uid;

        this.queryObservable = this.db.list(`${this.uid}/${this.categoryTitle}`, {
          query: {
            orderByChild: 'stage',
            equalTo: this.stageSubject,
            limitToFirst: 1,
          }
        });

        this.reservedStageObservable = this.db.list(`${this.uid}/${this.categoryTitle}`, {
          preserveSnapshot: true,
          query: {
            orderByChild: 'stage',
            equalTo: 0,
            limitToFirst: this.fillCountSubject
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
          equalTo: index,
        }
      }).subscribe(list => this.stageCount[index] = list.length);
    });
  }

  insert(data:any) {
    if(!this.isStageFull(1)) {
      this.card.question = data.question;
      this.card.answer = data.answer;
      this.card.source = data.source;
      this.card.stage = 0;  // reserve stage is 0

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
      if (!this.isStageFull(++card.stage)) {
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

    // TODO: (개선)카드 앞면으로 초기화
    this.show = true;
  }

  filterBy(stage: string) {
    this.stageSubject.next(stage);
    console.log(`[Current-Stage]${this.stageSubject.getValue()}`);
  }
  
  isStageFull(level): boolean {
    let isFull: boolean = false;

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

  importFromReserve():void {
    let alert = this.alertCtrl.create({
      title: '# of card is too low',
      message: `Do you want to fill cards from reserved stage?
        (R's stage count: ${this.stageCount[0]})`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');
            this.fillByReservedStage();
          }
        }
      ]
    });
    alert.present();
  }

  fillByReservedStage(): void {
    let remainArea = 30 - this.stageCount[1];
    let numOfReservedCards = this.stageCount[0];

    if(numOfReservedCards == 0) {
      console.log("reserved stage is empty..");
    } else if(remainArea >= numOfReservedCards) {
      this.fillCountSubject.next(numOfReservedCards);
    } else if(remainArea < numOfReservedCards) {
      this.fillCountSubject.next(remainArea);
    }
    console.log(`[Current-count subject]${this.fillCountSubject.getValue()}`);

    // TODO. 어쩔 수 없다. 그냥 키값을 다른 배열에 저장해 놓고 
    // 하나하나 데이터 업데이트 한다음에 다시 뺏다 넣어야 할것 같다.
    this.reservedStageObservable.subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        console.log(snapshot.key);
        console.log(snapshot.val());

        // this.queryObservable.remove(snapshot.key);
        // snapshot.val().stage = 1;
        // this.queryObservable.push(snapshot.val());
      });
    })
  }

}
