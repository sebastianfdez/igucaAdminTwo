import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Survey } from './survey';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {

  isLoading = false;
  survey: Survey = null;

  constructor(
    private db: AngularFireDatabase,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.db.object<Survey>('Survey').snapshotChanges().subscribe((survey) => {
        this.survey = survey.payload.val();
        if (!this.survey.questionsOpen || !this.survey.questionsOpen.length) {
          this.survey.questionsOpen = [];
          this.survey.questionsOpen.push({question: '', votes: false});
        }
        if (!this.survey.questionsVote || !this.survey.questionsVote.length) {
          this.survey.questionsVote = [];
          this.survey.questionsVote.push({question: '', votes: true});
        }
        this.isLoading = false;
    });
  }

  updateSurvey() {
    this.isLoading = true;
    setTimeout(() => {
      this.db.object<Survey>('Survey').update(this.survey).then(() => this.isLoading = false);
    }, 500);
  }

  pushQuestion(open: boolean) {
    (open ? this.survey.questionsOpen : this.survey.questionsVote).push({
      question: '', votes: open
    });
  }

  deleteQuestion(i: number, open: boolean) {
    (open ? this.survey.questionsOpen : this.survey.questionsVote).splice(i, 1);
  }

}
