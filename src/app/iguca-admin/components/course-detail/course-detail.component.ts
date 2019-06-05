import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database';
import { IgucaCourse, IgucaQuestion } from '../../models/course';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { MatButtonToggleChange, MatDialog } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import { WarningComponent } from '../warning/warning.component';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {

  public fileLoaderManual: FileUploader = new FileUploader({});
  public fileLoaderExersices: FileUploader = new FileUploader({});
  public fileLoaderAnswers: FileUploader = new FileUploader({});
  public fileLoaderExam: FileUploader = new FileUploader({});
  public fileLoaderQuestions: FileUploader[] = [];

  isNewCourse = true;
  isLoading = false;
  public urlAnswers = '';
  public urlExersices = '';
  public urlExam = '';
  public urlManual = '';
  public urlQuestion = [];
  openCourse: IgucaCourse = new IgucaCourse();
  openCourseKey = '';
  originalQuestionsNumber = 0;
  statusText: string[] = [];

  expireDate: Date;

  examFile: FileItem;
  manualFile: FileItem;
  exerciseFile: FileItem;
  answersFile: FileItem;
  questionsFiles: FileItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private router: Router,
    private afStorage: AngularFireStorage,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.db.object<IgucaCourse>(`Cursos/${params.id}`).snapshotChanges()
        .subscribe((action: AngularFireAction<DatabaseSnapshot<IgucaCourse>>) => {
          this.openCourse = action.payload.val();
          this.openCourseKey = action.key;
          this.setCourseData();
          this.setFileUploadersListeners();
          this.getStorageUrl();
          this.isLoading = false;
        });
        this.isNewCourse = false;
      } else {
        this.pushQuestion();
        this.isLoading = false;
      }
    });
  }

  getStorageUrl() { // gets the urls of the strorage Files of a especific courses
    const URL_ref_Manual = this.afStorage.ref(this.openCourseKey).child('Manual');
    URL_ref_Manual.getDownloadURL().subscribe(url => this.urlManual = url);

    const URL_ref_Exersices = this.afStorage.ref(this.openCourseKey).child('Ejercicios');
    URL_ref_Exersices.getDownloadURL().subscribe(url => this.urlExersices = url);

    const URL_ref_Answers = this.afStorage.ref(this.openCourseKey).child('Respuestas');
    URL_ref_Answers.getDownloadURL().subscribe(url => this.urlAnswers = url);

    const URL_ref_Exam = this.afStorage.ref(this.openCourseKey).child('Examen');
    URL_ref_Exam.getDownloadURL().subscribe(url => this.urlExam = url);

    if (this.openCourse.alternatives === false) {
      this.openCourse.finalExamOpen.forEach(q => {
        try {
          const URL_ref_Question = this.afStorage.ref(this.openCourseKey).child(`Question${q.number}`);
          console.log(URL_ref_Question);
          URL_ref_Question.getDownloadURL().subscribe((url) => {
            this.urlQuestion[q.number - 1] = url;
          }, (error) => {
            console.log(error);
          });
        } catch (e) {
        }
      });
    }
  }

  deleteQuestionFile(question: IgucaQuestion, file) {
    this.fileLoaderQuestions[question.number - 1].queue = this.fileLoaderQuestions[question.number - 1].queue.filter((file_) => {
      return file_ !== file;
    });
    question.hasFile = false;
  }

  setFileUploadersListeners() {
    this.fileLoaderManual.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;
      item.alias = 'manual';
      this.manualFile = item;
    };

    this.fileLoaderExersices.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;
      item.alias = 'exersices';
      this.exerciseFile = item;
    };

    this.fileLoaderExam.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;
      item.alias = 'exam';
      this.examFile = item;
    };

    this.fileLoaderAnswers.onAfterAddingFile = (item: FileItem) => {
      item.withCredentials = false;
      item.alias = 'answers';
      this.answersFile = item;
    };

    this.fileLoaderQuestions.forEach((fl, i) => {
      fl.onAfterAddingFile = (item: FileItem) => {
        item.withCredentials = false;
        item.alias = 'question';
        fl.queue = [item];
        this.questionsFiles[i] = item;
        this.openCourse.finalExamOpen[i].hasFile = true;
      };
    });
  }

  setCourseData() {
    if (this.openCourse.alternatives === false) {
      this.openCourse.finalExamOpen.forEach((q) => {
        this.urlQuestion.push('');
        this.fileLoaderQuestions[q.number - 1] = new FileUploader({
          allowedFileType: ['pdf']
        });
      });
    }
    this.originalQuestionsNumber = this.openCourse.alternatives ? this.openCourse.finalExam.length : this.openCourse.finalExamOpen.length;
    this.openCourse.finalExam.forEach(q => q.alternatives = q.alternatives !== undefined ? q.alternatives : true);
    if (!this.openCourse.finalExamOpen) {
      this.openCourse.finalExamOpen = [];
    }
    if (!this.openCourse.finalExam) {
      this.openCourse.finalExam = [];
    }
  }

  alternativeOptionChange(event: MatButtonToggleChange) {
    this.openCourse.alternatives = event.value === 'alternatives' ? true : false;
  }

  pushQuestion() {
    const newQuestion: IgucaQuestion = new IgucaQuestion();
    newQuestion.alternatives = this.openCourse.alternatives;
    if ( this.openCourse.alternatives) {
      newQuestion.number = this.openCourse.finalExam.length + 1;
      this.openCourse.finalExam.push(newQuestion);
    } else {
      newQuestion.number = this.openCourse.finalExamOpen.length + 1;
      const FU = new FileUploader({
        allowedFileType: ['pdf']
      });
      FU.onAfterAddingFile = (item: FileItem) => {
        item.withCredentials = false;
        item.alias = 'question';
        FU.queue = [item];
        this.questionsFiles[newQuestion.number - 1] = item;
      };
      this.urlQuestion.push('');
      this.fileLoaderQuestions.push(FU);
      this.openCourse.finalExamOpen.push(newQuestion);
    }
  }

  deleteQuestion(question: IgucaQuestion) {
    if (!this.isNewCourse && question.hasFile) {
      const dialogRef = this.dialog.open(WarningComponent, {
        width: '600px',
        data: {
          message: `El archivo de esta pregunta se eliminara indefinidamente`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          try {
            const task = this.afStorage.ref(this.openCourseKey).child(`Question${question.number}`).delete();
            this.makeDelete(question);
            console.log('Question deleted: ', task);
          } catch (e) {
            console.log(e);
          }
        }
      });
    } else {
      this.makeDelete(question);
    }
  }

  deleteManual(file) {
    this.fileLoaderManual.queue = this.fileLoaderManual.queue.filter((file_) => {
      return file_ !== file;
    });
  }

  deleteExercise(file) {
    this.fileLoaderExersices.queue = this.fileLoaderExersices.queue.filter((file_) => {
      return file_ !== file;
    });
  }

  deleteExam(file) {
    this.fileLoaderExam.queue = this.fileLoaderExam.queue.filter((file_) => {
      return file_ !== file;
    });
  }

  deleteAnswers(file) {
    this.fileLoaderAnswers.queue = this.fileLoaderAnswers.queue.filter((file_) => {
      return file_ !== file;
    });
  }

  makeDelete(question: IgucaQuestion) {
    if (this.openCourse.alternatives) {
      this.openCourse.finalExam = this.openCourse.finalExam.filter((question_) => {
        return question_.number !== question.number;
      });
    } else {
      this.openCourse.finalExamOpen = this.openCourse.finalExamOpen.filter((question_) => {
        return question_.number !== question.number;
      });
    }
    console.log(this.fileLoaderQuestions);
    this.fileLoaderQuestions.splice(question.number - 1);
    console.log(this.fileLoaderQuestions);
    this.urlQuestion.splice(question.number - 1);
    this.resetNumbers();
  }

  resetNumbers() {
    if (this.openCourse.alternatives) {
      this.openCourse.finalExam.forEach((question, i) => {
        question.number = i + 1;
      });
    } else {
      this.openCourse.finalExamOpen.forEach((question, i) => {
        question.number = i + 1;
      });
    }
  }

  setCorrectAnswer(value: string, question: IgucaQuestion) {
    question.correct = value;
  }

  sendCourse() {
    if (this.validateCourse()) {
      if (this.isNewCourse) {
        const key = this.addCourse(this.openCourse);
        this.uploadFile(this.manualFile, 'Manual', key);
        this.uploadFile(this.exerciseFile , 'Ejercicios', key);
        this.uploadFile(this.examFile , 'Examen', key);
        this.uploadFile(this.answersFile, 'Respuestas', key);
        this.questionsFiles.forEach((file, i) => {
          this.uploadFile(file, `Question${i}`, key);
        });
        this.router.navigate(['courses']);
      }
    }
  }

  updateCourse() {
    if (this.validateCourse()) {
      try {
        this.db.database.ref(`Cursos/${this.openCourseKey}`).update(this.openCourse);
        if (this.manualFile) {
          this.updateFile(this.manualFile, 'Manual');
        }
        if (this.exerciseFile) {
          this.updateFile(this.exerciseFile, 'Ejercicios');
        }
        if (this.examFile) {
          this.updateFile(this.examFile, 'Examen');
        }
        if (this.answersFile) {
          this.updateFile(this.answersFile, 'Respuestas');
        }
        console.log(this.questionsFiles);
        this.questionsFiles.forEach((file, i) => {
          if (file) {
            console.log(i);
            this.updateFile(file, `Question${i + 1}`);
          }
        });
        this.router.navigate(['courses']);
      } catch (e) {
        console.log(e);
      }
    }
  }

  updateFile(item: FileItem, file: string) {
    try {
      const task = this.afStorage.ref(this.openCourseKey).child(file).delete();
    } catch (e) {
      console.log(e);
    }
    this.uploadFile(item, file , this.openCourseKey);
  }


  uploadFile(item: FileItem, file: string, key: string) {
    try {
      const task = this.afStorage.ref(key).child(file).put(item.file.rawFile);
    } catch (e) {
      console.log(e);
    }
  }

  validateCourse(): boolean { // conditions that must be done before uploading or updating a course
    this.statusText = [];
    let isValid = true;
    if (this.openCourse.name === '') {
      this.statusText.push('Falta agregar el nombre del curso');
      isValid = false;
    }
    if (this.isNewCourse) {
      if (!this.manualFile) {
        isValid = false;
        this.statusText.push('Falta documento manual');
      }
      if (!this.exerciseFile) {
        isValid = false;
        this.statusText.push('Falta documento Ejercicos');
      }
      if (!this.examFile) {
        isValid = false;
        this.statusText.push('Falta documento Examen');
      }
      if (!this.answersFile) {
        isValid = false;
        this.statusText.push('Faltan documento Respuestas');
      }
    }
    if (this.openCourse.finalExam.length === 0) {
      this.statusText.push('Falta agregar al menos una pregunta');
      isValid = false;
    }
    if (this.openCourse.alternatives) {
      this.openCourse.finalExam.forEach((question) => {
        if (question.question === '') {
          this.statusText.push('Alguna pregunta no tiene enunciado');
          isValid = false;
        }
        if (question.correct === '') {
          this.statusText.push('Alguna pregunta no tiene respuesta correcta');
          isValid = false;
        }

        if (question.a === '') {
          this.statusText.push('Las preguntas deben tener al menos 2 alternativas ( a y b )');
          isValid = false;
        }
        if (question.b === '') {
          this.statusText.push('Las preguntas deben tener al menos 2 alternativas (a y b )');
          isValid = false;
        }
      });
    } else {
      this.openCourse.finalExamOpen.forEach((question) => {
        if (question.question === '') {
          this.statusText.push('Alguna pregunta no tiene enunciado');
          isValid = false;
        }
      });
    }
    return isValid;
  }

  addCourse(newCourse: IgucaCourse): string {
    return this.db.database.ref('Cursos').push(newCourse).key;
  }

}
