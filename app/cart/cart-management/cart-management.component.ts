import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ResearchService } from '../../research/research.service';

@Component({
  selector: 'app-cart-management',
  templateUrl: './cart-management.component.html',
  styleUrls: ['./cart-management.component.css']
})
export class CartManagementComponent implements OnInit {

  private email :string;
  public product : any;
  private name : string;
  public action: string;
  private numAction : number = 1;

  constructor(private cart: CartService, private route: ActivatedRoute, private research : ResearchService, private router : Router) { }

  cartProductManagement (action, productId) {

    if(action === 'add'){
      this.action = "Ajout";
    }
    if(action === 'remove'){
      this.action = "Retrait";
    }
    this.cart.getProductById(productId).subscribe(res => this.product = res);

    this.cart.modifyCart(action, productId, this.email).subscribe(res => {
      this.router.navigate(['/cart', {outlets: {'cartDisplay' : ['display', this.numAction]}}]);
      this.numAction++;
    });
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cartProductManagement(params["action"], params["id"]);
    });
  }

}
