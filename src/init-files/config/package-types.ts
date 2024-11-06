class Customer {
  customerId: number;
  name: string;
  age: number | null;

  constructor(customerId: number, name: string, age: number | null = null) {
    this.customerId = customerId;
    this.name = name;
    this.age = age;
  }
}

class Product {
  productId: number;
  name: string;
  price: number | null;

  constructor(productId: number, name: string, price: number | null = null) {
    this.productId = productId;
    this.name = name;
    this.price = price;
  }
}

class Order {
  orderId: number;
  customer: Customer;
  products: Product[];
  orderDate: Date;
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
