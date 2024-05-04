import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerFactory from "../factory/customer.factory";
import Address from "../value-object/address";
import AddressChangedEvent from "./address-changed.event";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

describe("Domain events tests", () => {
  it("should notify all event handlers when an address has changed", () => {
    const eventDispatcher = new EventDispatcher();
    const enviaConsoleLogHandler = new EnviaConsoleLogHandler();
    const spyEventLog1Handler = jest.spyOn(enviaConsoleLogHandler, "handle");

    eventDispatcher.register("AddressChangedEvent", enviaConsoleLogHandler);

    expect(
      eventDispatcher.getEventHandlers["AddressChangedEvent"][0]
    ).toMatchObject(enviaConsoleLogHandler);

    const customer = CustomerFactory.create("Customer X");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);

    const addressChangedEvent = new AddressChangedEvent({customer});

    eventDispatcher.notify(addressChangedEvent);

    expect(spyEventLog1Handler).toHaveBeenCalled();
  });
});
