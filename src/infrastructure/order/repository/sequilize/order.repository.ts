import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderFactory from "../../../../domain/checkout/factory/order.factory";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const sequelize = OrderModel.sequelize;
    await sequelize.transaction(async (t) => {
      await OrderItemModel.destroy({
        where: {
          order_id: entity.id,
        },
        transaction: t,
      });

      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id
      }));

      await OrderItemModel.bulkCreate(items, { transaction: t });
      
      await OrderModel.update(
        {
          customer_id: entity.customerId,
          total: entity.total(),
        },
        {
          where: {
            id: entity.id,
          },
          transaction: t
        }
      );
    });
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: ["items"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    return new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map(
        (orderItemModel) =>
          new OrderItem(
            orderItemModel.id,
            orderItemModel.name,
            orderItemModel.price,
            orderItemModel.product_id,
            orderItemModel.quantity
          )
      )
    );
  }

  async findAll(): Promise<Order[]> {
    const ordersModel = await OrderModel.findAll({ include: ["items"] });
    const orders = ordersModel.map((orderModel) =>
      OrderFactory.create({
        id: orderModel.id,
        customerId: orderModel.customer_id,
        items: orderModel.items.map((item) => ({
          id: item.id,
          name: item.name,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    );
    return orders;
  }
}
