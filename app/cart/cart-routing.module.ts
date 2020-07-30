import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartManagementComponent } from './cart-management/cart-management.component';
import { CartDisplayComponent } from './cart-display/cart-display.component';
import { CartValidationComponent } from './cart-validation/cart-validation.component';

const routes: Routes = [
    { path: 'management/:action/:id/:numAction', component: CartManagementComponent, outlet: 'cartManagement' },
    { path: 'display/:numAction', component: CartDisplayComponent, outlet: 'cartDisplay' },
    { path: 'validation', component: CartValidationComponent, outlet: 'cartValidation' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CartRoutingModule { }
