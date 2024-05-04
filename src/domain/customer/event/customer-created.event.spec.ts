import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerFactory from "../factory/customer.factory";
import CustomerCreatedEvent from './customer-created.event';
import EnviaConsoleLog1Handler from "./handler/envia-console-log1.handler";
import EnviaConsoleLog2Handler from './handler/envia-console-log2.handler';

describe("Domain events tests", () => {
  it("should notify all event handlers when a customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
    const enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();
    const spyEventLog1Handler = jest.spyOn(enviaConsoleLog1Handler, "handle");
    const spyEventLog2Handler = jest.spyOn(enviaConsoleLog2Handler, "handle");

    eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog1Handler);
    eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog2Handler);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(enviaConsoleLog1Handler);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(enviaConsoleLog2Handler);

    const customerCreatedEvent = new CustomerCreatedEvent(CustomerFactory.create("Customer X"));

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventLog1Handler).toHaveBeenCalled();
    expect(spyEventLog2Handler).toHaveBeenCalled();
  });
});
