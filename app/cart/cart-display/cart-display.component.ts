import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { CartService } from "../cart.service";

@Component({
  templateUrl: './cart-display.component.html',
  styleUrls: ['./cart-display.component.css']
})
export class CartDisplayComponent implements OnInit {
  public products :Object[];  // --aot
  private email :string;
  public total :number = 0;  // --aot

  private numAction :number = 0;

  constructor( private identification :AuthService,
               private cart :CartService,
               private route :ActivatedRoute,
	       private router :Router ) {
     this.email = identification.email;
  }

  ngOnInit() {
     this.route.params.subscribe(params => {
          console.log("Raffraîchissement du panier");
          this.cart.getCartProducts("products/email="+this.email)
                   .subscribe(res => {this.products = res;
		                      this.total = 0;
                                      for (let p of res) {
                                         this.total += p.price * p.nb;
                                      }
                                     },
                              err => console.error(err),
                              () => console.log('getCartProducts done'));
          });
  }

  addCartProduct(productId) {
     console.log("AJOUT DANS LE PANIER DE "+productId+" ("+this.numAction+")");
     this.router.navigate(['/cart', {outlets:{'cartManagement': ['management', 'add', productId, this.numAction]}}]);
     this.numAction++;
  }

  removeCartProduct(productId) {
     console.log("RETRAIT DANS LE PANIER DE "+productId+" ("+this.numAction+")");
     this.router.navigate(['/cart', {outlets:{'cartManagement': ['management', 'remove', productId, this.numAction]}}]);
     this.numAction++;
  }

  cartReset() {
     console.log("Reset du panier");
     this.total = 0;
     this.cart.cartReset(this.email)
              .subscribe(res => { console.log("Reset ok");
                                  this.router.navigate(['/cart', {outlets:{'cartDisplay': ['display', -1]}}]);
                                },
                         err => console.error(err),
                         () => console.log('getCartProducts done'));
  }

  cartValidation() {
     console.log("Validation du panier");
     this.router.navigate(['/cart', {outlets:{'cartValidation': ['validation']}}]);
  }

}


