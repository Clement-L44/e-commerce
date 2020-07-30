import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { CartModule } from './cart/cart.module';
import { ResearchModule } from './research/research.module';



import { EvenOddPipe } from './even-odd.pipe';

import { AuthComponent } from './auth/auth.component';
import { TestComponent } from './test/test.component';
import { AppComponent } from './app.component';

import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './auth/auth-guard.service';

@NgModule({

  declarations: [
    AppComponent,
    EvenOddPipe,
    AuthComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CartModule,
    ResearchModule

  ],
  providers: [AuthService, AuthGuardService],
  bootstrap: [AppComponent]
})

export class AppModule { }
