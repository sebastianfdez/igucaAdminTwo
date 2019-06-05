import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonToggleModule,
  MatRadioModule,
  MatDialogModule,
} from '@angular/material';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';

import { environment } from 'src/environments/environment';
import { AuthGuardService } from './auth-services/auth-guard.service';
import { AuthService } from './auth-services/auth.service';

import { AppComponent } from './app.component';
import { AdminMenuComponent } from './iguca-admin/components/admin-menu/admin-menu.component';
import { LoginComponent } from './iguca-admin/components/login/login.component';
import { CourseDetailComponent } from './iguca-admin/components/course-detail/course-detail.component';
import { FileSelectDirective } from 'ng2-file-upload';
import { WarningComponent } from './iguca-admin/components/warning/warning.component';
import {
  ExistingCoursesCompaniesComponent
} from './iguca-admin/components/existing-courses-companies/existing-courses-companies.component';
import { CompanyDetailComponent } from './iguca-admin/components/company-detail/company-detail.component';
import { ReportsComponent } from './iguca-admin/components/reports/reports.component';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { SurveyComponent } from './iguca-admin/components/survey/survey.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin', component: AdminMenuComponent, canActivate: [AuthGuardService] },
  { path: 'courses', component: ExistingCoursesCompaniesComponent, canActivate: [AuthGuardService], data: { courses: true } },
  { path: 'companies', component: ExistingCoursesCompaniesComponent, canActivate: [AuthGuardService], data: { courses: false } },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuardService] },
  { path: 'survey', component: SurveyComponent, canActivate: [AuthGuardService] },
  { path: 'courses/new', component: CourseDetailComponent, canActivate: [AuthGuardService] },
  { path: 'courses/:id', component: CourseDetailComponent, canActivate: [AuthGuardService] },
  { path: 'companies/new', component: CompanyDetailComponent, canActivate: [AuthGuardService] },
  { path: 'companies/:id', component: CompanyDetailComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: 'admin' },
];

const materialModules = [
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonToggleModule,
  MatRadioModule,
  MatDialogModule,
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminMenuComponent,
    ExistingCoursesCompaniesComponent,
    CourseDetailComponent,
    FileSelectDirective,
    WarningComponent,
    CompanyDetailComponent,
    ReportsComponent,
    SurveyComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ...materialModules,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireDatabaseModule, ExcelExportModule,
  ],
  providers: [
    AuthService,
    AuthGuardService,
  ],
  entryComponents: [
    WarningComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AppModule { }
