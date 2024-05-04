import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import AddressChangedEvent from "../address-changed.event";

export default class EnviaConsoleLogHandler
  implements EventHandlerInterface<AddressChangedEvent>
{
  handle(event: AddressChangedEvent): void {
    const id = event.customer.id;
    const nome = event.customer.name;
    const endereco = event.customer.address;
    console.log(`Endereço do cliente: ${id}, ${nome} alterado para: ${endereco}`);
  }
}
