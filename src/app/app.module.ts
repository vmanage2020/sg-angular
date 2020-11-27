import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptor } from './core/helpers/error.interceptor';
import { JwtInterceptor } from './core/helpers/jwt.interceptor';
import { FakeBackendProvider } from './core/helpers/fake-backend';
import { initializeApp, constantsApp } from './app.initializer';
import { AppConfig } from './app.config';

import { LayoutsModule } from './layouts/layouts.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AccessDeniedComponent } from './account/auth/access-denied/access-denied.component';
import { NgxMaskModule } from 'ngx-mask';
import { SharedService } from './shared/shared.service';
import { SharedModule } from './shared/shared.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'; 

//import { IntegralUIModule } from '@lidorsystems/integralui-web/bin/integralui/integralui.module';

@NgModule({
  declarations: [
    AppComponent, AccessDeniedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutsModule,
    AppRoutingModule, SharedModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    // admin.initializeApp({
    //   credential: admin.credential.applicationDefault(),
    //   databaseURL: '',
    // }),
    AngularFirestoreModule,
    AngularFireAuthModule,
    //IntegralUIModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),
     
  ],
  providers: [
    // {provide: LocationStrategy, useClass: HashLocationStrategy},
    TitleCasePipe,
   AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: constantsApp,
      deps: [AppConfig], multi: true
    }, 
    DatePipe,
 ],
  bootstrap: [AppComponent]
})
export class AppModule { }
