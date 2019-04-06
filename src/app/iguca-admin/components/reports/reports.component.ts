import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UserReport } from '../../models/report';
import { combineLatest } from 'rxjs';
import { IgucaCourse } from '../../models/course';
import { ExcelExportComponent } from '@progress/kendo-angular-excel-export';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WarningComponent } from '../warning/warning.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isReportCharged = false;
  isReportChargedKeys = false;
  date = new Date();

  coursesReport: {
    keyReportCourse: string;
    listReports: UserReport[];
  }[];
  coursesNamesReports: {
    key: string,
    name: string,
    reports: UserReport[],
    questionsHeaders: string[],
  }[] = [];

  constructor(
    private db: AngularFireDatabase,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    combineLatest(
      this.db.list<{[key: string]: UserReport}>('Reports').snapshotChanges(),
      this.db.list<IgucaCourse>('Cursos').snapshotChanges(),
    )
    .subscribe(([reports, courses]) => {
      this.coursesReport = reports.map((action) => {
        const reports_: UserReport[] = Object.values(action.payload.val());
        reports_.forEach(report => report.date = this.getDateFormatted(report.date));
        return {
          keyReportCourse: action.payload.key,
          listReports: reports_,
        };
      });
      const coursesNameKeysQuestions = courses.map((course) => {
        return {
          key: course.payload.key,
          name: course.payload.val().name,
          questionsHeaders: course.payload.val().alternatives ?
            course.payload.val().finalExam.map(question => question.correct) :
            course.payload.val().finalExamOpen.map(question => question.question),
        };
      });
      this.coursesReport.forEach((report) => {
        const courseMatch = coursesNameKeysQuestions.find((course_) => course_.key === report.keyReportCourse);
        this.coursesNamesReports.push({
          name: courseMatch.name,
          reports: report.listReports,
          key: report.keyReportCourse,
          questionsHeaders: courseMatch.questionsHeaders,
        });
      });
      this.isReportCharged = true;
      console.log(this.coursesNamesReports);
      this.addResponses();
    });
  }

  public save(component: ExcelExportComponent): void {
    const options = component.workbookOptions();
    const rows = options.sheets[0].rows;
    rows.forEach((row: any) => {
      if (row.type === 'data') {
        for (let i = 0; i < (row.cells.length - 7); i++) {
          if (!this.compareMatch(row.cells[7 + i].value, (rows[1].cells[7 + i].value as string)) &&
          (rows[1].cells[7 + i].value as string).length === 1) {
            row.cells[7 + i].background = '#ff0000';
          }
        }
      }
    });
    component.save(options);
  }

  getDateFormatted(dateString: string): string {
    if (dateString) {
      const date = new Date(dateString);
      // tslint:disable-next-line:max-line-length
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} (${date.getHours()}:${date.getMinutes()}hr)`;
    } else {
      return 'Fecha no encontrada';
    }
  }

  compareMatch(a: string, b: string): boolean {
    return a ? a[0].toLowerCase() === b[0].toLowerCase() : true;
  }

  homePage() {
    this.router.navigate([`admin`]);
  }

  deleteReport(courseReport: {
    name: string,
    reports: UserReport[],
    key: string,
  }) {
    const dialogRef = this.dialog.open(WarningComponent, {
      width: '600px',
      data: {
        message: `Seguro que quieres eliminar los reportes de '${courseReport.name}'? Una vez eliminados no podran recuperarse.`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.database.ref('Reports').child(courseReport.key).remove();
      }
    });
  }

  addResponses() {
    this.coursesNamesReports.forEach((report) => {
      const courseResponse: UserReport = {
        company: '',
        idSence: '',
        rut: '',
        score: '',
        userName: '',
        userMail: '',
        questions: report.questionsHeaders,
        date: '',
        alternatives: true,
      };
      report.reports.unshift(courseResponse);
    });
  }

}
