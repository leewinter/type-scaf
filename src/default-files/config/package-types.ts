class Customer {
  @primaryKey
  customerId: number;
  @required
  @optionsLabel
  name: string;
  age: number | null;

  constructor(customerId: number, name: string, age: number | null = null) {
    this.customerId = customerId;
    this.name = name;
    this.age = age;
  }
}

class Product {
  @primaryKey
  productId: number;
  @required
  @optionsLabel
  name: string;
  price: number | null;

  constructor(productId: number, name: string, price: number | null = null) {
    this.productId = productId;
    this.name = name;
    this.price = price;
  }
}

class Order {
  @primaryKey
  orderId: number;
  @required
  customer: Customer;
  products: Product[];
  @required
  orderDate: Date;
  @required
  totalAmount: number;

  constructor(
    orderId: number,
    customer: Customer,
    products: Product[] = [],
    orderDate: Date,
    totalAmount: number
  ) {
    this.orderId = orderId;
    this.customer = customer;
    this.products = products;
    this.orderDate = orderDate;
    this.totalAmount = totalAmount;
  }
}
