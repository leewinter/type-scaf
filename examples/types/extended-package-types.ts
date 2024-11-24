class Address {
  @primaryKey
  addressId: number;
  @required
  @optionsLabel
  street: string;
  @required
  city: string;
  state: string;
  country: string;
  @required
  postalCode: string;

  constructor(
    addressId: number,
    street: string,
    city: string,
    state: string,
    country: string,
    postalCode: string
  ) {
    this.addressId = addressId;
    this.street = street;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
  }
}

class Customer {
  @primaryKey
  customerId: number;
  @required
  @optionsLabel
  name: string;
  age: number | null;
  @required
  address: Address;

  constructor(
    customerId: number,
    name: string,
    address: Address,
    age: number | null = null
  ) {
    this.customerId = customerId;
    this.name = name;
    this.age = age;
    this.address = address;
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
