import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database';
import { IgucaCompany } from '../../models/company';
import { AngularFireStorage } from '@angular/fire/storage';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { IgucaCourse } from '../../models/course';
import { MatDialog } from '@angular/material';
import { WarningComponent } from '../warning/warning.component';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {

  isLoading = false;

  openCompany: IgucaCompany = new IgucaCompany();
  openCompanyKey = '';
  companyCoursesNames: string[] = [];
  coursesNotSelected: IgucaCourse[] = [];
  isNewCompany = true;

  allCourses: IgucaCourse[] = [];
  newCourse: IgucaCourse = null;
  newIdSence = '';

  urlIcon = '';
  public fileLoaderIcon: FileUploader = new FileUploader({
    allowedFileType: ['image'],
  });
  companyIcon: FileItem;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private afStorage: AngularFireStorage,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.db.list<IgucaCourse>('Cursos').snapshotChanges()
      .subscribe((actions: AngularFireAction<DatabaseSnapshot<IgucaCourse>>[]) => {
        this.allCourses = actions.map((action) => {
          const course: IgucaCourse = action.payload.val();
          course.key = action.payload.key;
          return course;
        });
        console.log(this.allCourses);
        if (params.id) {
          this.db.object<IgucaCompany>(`Companies/${params.id}`).snapshotChanges()
          .subscribe((action: AngularFireAction<DatabaseSnapshot<IgucaCompany>>) => {
            this.openCompany = action.payload.val();
            this.openCompanyKey = action.key;
            this.setFileUploadersListeners();
            this.getStorageUrl();
            this.getCoursesNames();
            this.isLoading = false;
            console.log(this.openCompany);
          });
          this.isNewCompany = false;
        } else {
          this.isLoading = false;
          this.openCompany.name = '';
          this.openCompany.courses = [];
          this.openCompany.idSence = [];
          this.companyCoursesNames = [];
          this.coursesNotSelected = this.allCourses;
          this.setFileUploadersListeners();
        }
      });
    });
  }

  addCourse() {
    if (!this.openCompany.courses) {
      this.openCompany.courses = [];
    }
    this.openCompany.courses.push(this.newCourse.key);
    this.openCompany.idSence.push(this.newIdSence);
    this.getCoursesNames();
    this.newCourse = null;
    this.newIdSence = '';
  }

  deleteCourse(courseName: string, idSence: string) {
    this.openCompany.courses = this.openCompany.courses.filter((course_) => {
      return course_ !== this.allCourses.filter(course__ => course__.name === courseName)[0].key;
    });
    console.log(this.openCompany.courses);
    this.openCompany.idSence = this.openCompany.idSence.filter((idSence_) => {
      return idSence_ !== idSence;
    });
    this.getCoursesNames();
  }

  getCoursesNames() {
    this.companyCoursesNames = this.allCourses.filter(course => this.openCompany.courses.includes(course.key)).map(course => course.name);
    this.coursesNotSelected = this.allCourses.filter(course => !this.openCompany.courses.includes(course.key));
  }

  getStorageUrl() {
    try {
      const URL_ref_Icon = this.afStorage.ref('Icons').child(this.openCompanyKey);
      URL_ref_Icon.getDownloadURL().subscribe(url => this.urlIcon = url);
    } catch (e) {}
  }

  setFileUploadersListeners() {
    this.fileLoaderIcon.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;
      item.alias = 'manual';
      this.companyIcon = item;
    };
  }

  updateCompany() {
    this.db.object<IgucaCompany>(`Companies/${this.openCompanyKey}`).update(this.openCompany).then(() => {
      if (this.companyIcon) {
        this.updateFile(this.companyIcon, this.openCompanyKey);
      }
      this.router.navigate(['/companies']);
    }).catch((e) => {
      const dialogRef = this.dialog.open(WarningComponent, {
        width: '600px',
        data: {
          message: e,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
      });
    });
  }

  sendCompany() {
    const key = this.db.database.ref('Companies').push(this.openCompany).key;
    if (key) {
      this.afStorage.ref('Icons').child(key).put(this.companyIcon.file.rawFile);
      this.router.navigate(['companies']);
    }
  }

  updateFile(item: FileItem, file: string) {
    try {
      this.afStorage.ref('Icons').child(file).delete();
      this.afStorage.ref('Icons').child(file).put(item.file.rawFile);
    } catch (e) {
      console.log(e);
    }
  }


}
