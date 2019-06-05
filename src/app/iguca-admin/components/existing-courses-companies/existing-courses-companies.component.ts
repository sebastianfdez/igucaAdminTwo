import { Component, OnInit } from '@angular/core';
import { IgucaCourse } from '../../models/course';
import { AngularFireDatabase, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database';
import { Router, ActivatedRoute } from '@angular/router';
import { IgucaCompany } from '../../models/company';
import { MatDialog } from '@angular/material';
import { WarningComponent } from '../warning/warning.component';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-existing-courses-companies',
  templateUrl: './existing-courses-companies.component.html',
  styleUrls: ['./existing-courses-companies.component.scss']
})
export class ExistingCoursesCompaniesComponent implements OnInit {

  courses: IgucaCourse[] = [];
  companies: IgucaCompany[] = [];
  isCourses = true;

  constructor(
    private db: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private afStorage: AngularFireStorage,
  ) {
    this.route.data.subscribe((data) => {
      if (data.courses) {
        db.list<IgucaCourse>('Cursos').snapshotChanges().subscribe((values: AngularFireAction<DatabaseSnapshot<IgucaCourse>>[]) => {
          this.courses = values.map((course) => {
            const courseData: IgucaCourse = course.payload.val();
            const key = course.payload.key;
            courseData.key = key;
            return courseData;
          });
        });
      } else {
        this.isCourses = false;
        db.list<IgucaCompany>('Companies').snapshotChanges().subscribe((values: AngularFireAction<DatabaseSnapshot<IgucaCompany>>[]) => {
          this.companies = values.map((company: AngularFireAction<DatabaseSnapshot<IgucaCompany>>) => {
            const courseData: IgucaCompany = company.payload.val();
            const key = company.payload.key;
            courseData.key = key;
            return courseData;
          });
        });
      }
    });
  }

  ngOnInit() {
  }

  editCourse(key: string) {
    this.isCourses ? this.router.navigate([`/courses/${key}`]) : this.router.navigate([`/companies/${key}`]);
  }

  newCourse() {
    this.isCourses ? this.router.navigate([`/courses/new`]) : this.router.navigate([`/companies/new`]);
  }

  deleteCourse(course: IgucaCourse | IgucaCompany) {
    console.log(course);
    const dialogRef = this.dialog.open(WarningComponent, {
      width: '600px',
      data: {
        message: `Seguro que quieres eliminar '${course.name}'? Una vez eliminada no puede recuperarse`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.isCourses) {
          this.deleteStorageCourse(course.key, (course as IgucaCourse).alternatives ? 0 : (course as IgucaCourse).finalExamOpen.length);
          this.db.database.ref('Cursos').child(course.key).remove((error) => {
            console.log('error: ', error);
          });
        } else {
          try {
            this.afStorage.storage.ref(`Icons`).child(course.key).delete();
            this.db.database.ref('Companies').child(course.key).remove((error) => {
              console.log('error: ', error);
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }

  deleteStorageCourse(key: string, questionFiles: number) {
    try {
      this.afStorage.ref(key).child('Examen').delete();
      this.afStorage.ref(key).child('Respuestas').delete();
      this.afStorage.ref(key).child('Ejercicios').delete();
      this.afStorage.ref(key).child('Manual').delete();

    } catch (e) {
      console.log(e);
    }
    for (let i = 0; i < questionFiles; i++) {
      try {
        this.afStorage.ref(key).child(`Question${i + 1}`).delete();
      } catch (e) {
        console.log(e);
      }
    }
  }

}
