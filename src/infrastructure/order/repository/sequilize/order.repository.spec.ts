import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";
import CustomerFactory from '../../../../domain/customer/factory/customer.factory';
import ProductFactory from "../../../../domain/product/factory/product.factory";
import OrderFactory from '../../../../domain/checkout/factory/order.factory';

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });



  it("should update an order", async () => {

      const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
      const customer = CustomerFactory.createWithAddress("Customer 1", address);
      const customerRepository = new CustomerRepository();
      await customerRepository.create(customer);

      const product1 = ProductFactory.create("a", "Product 1", 10) as Product;
      
      const productRepository = new ProductRepository();
      await productRepository.create(product1);

      const order = OrderFactory.create({ id: "1", customerId: customer.id, items: [new OrderItem("1", product1.name, product1.price, product1.id, 1)] });
      
      const orderRepository = new OrderRepository();
      await orderRepository.create(order);

      const orderResult = await orderRepository.find(order.id);
      
      expect(order).toStrictEqual(orderResult);

      const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
      const customer2 = CustomerFactory.createWithAddress("Customer 2", address2);

      customer2.changeAddress(address2);
      await customerRepository.create(customer2);
      order.changeCustomer(customer2.id)

     await orderRepository.update(order);

    const orderResult2 = await orderRepository.find(order.id);
      
    expect(order).toStrictEqual(orderResult2);

  });
  


  it("should find an order by id", async () => {

    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = CustomerFactory.createWithAddress("Customer 1", address);
    const customerRepository = new CustomerRepository();
    await customerRepository.create(customer);

    const product1 = ProductFactory.create("a", "Product 1", 10) as Product;
    
    const productRepository = new ProductRepository();
    await productRepository.create(product1);

    const order = OrderFactory.create({ id: "1", customerId: customer.id, items: [new OrderItem("1", product1.name, product1.price, product1.id, 1)] });

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

      const orderResult = await orderRepository.find(order.id);
      
      expect(order).toStrictEqual(orderResult);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("some-fake-id");
    }).rejects.toThrow("Order not found");

  });
  
  it("should find all orders", async () => {

    const orderRepository = new OrderRepository();
    const emptyOrders = await orderRepository.findAll();

    expect(emptyOrders.length).toBe(0);

    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = CustomerFactory.createWithAddress("Customer 1", address);
    const customerRepository = new CustomerRepository();
    await customerRepository.create(customer);

    const product1 = ProductFactory.create("a", "Product 1", 10) as Product;
    const product2 = ProductFactory.create("a", "Product 2", 10) as Product;
    
    const productRepository = new ProductRepository();
    await productRepository.create(product1);
    await productRepository.create(product2);

    const order1 = OrderFactory.create({ id: "1", customerId: customer.id, items: [new OrderItem("1", product1.name, product1.price, product1.id, 1)] });
    const order2 = OrderFactory.create({ id: "2", customerId: customer.id, items: [new OrderItem("2", product2.name, product2.price, product2.id, 2)] });

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders.length).toBe(2);

  });

});
