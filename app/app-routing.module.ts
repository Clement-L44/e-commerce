import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { AuthComponent } from './auth/auth.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [

  {
    path: 'research', loadChildren: './research/research.module#ResearchModule'
  },
  {
    path: 'cart', loadChildren: './cart/cart.module@CartModule', canActivate:[AuthGuardService]
  },
  {
    path: 'test', component: TestComponent, canActivate: [AuthGuardService]
  },
  {
    path: 'login', component: AuthComponent, outlet:'login'
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
