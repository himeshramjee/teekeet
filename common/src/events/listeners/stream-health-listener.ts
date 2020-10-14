import { Message } from "node-nats-streaming";
import { NATSBaseListener } from "../base-classes/base-listener";
import { iNatsHealthDeepPingEvent } from "../interfaces/iNat-health-deep-ping-event";
import { ListenerGroups, Subjects } from "../types/nats-custom-types";

export class StreamHealthListener extends NATSBaseListener<iNatsHealthDeepPingEvent> {
  readonly subject: Subjects.NATS_HEALTH_DEEP_PING = Subjects.NATS_HEALTH_DEEP_PING;
  readonly queueGroupName = ListenerGroups.NAT_HEALTH;

  onMessage(data: iNatsHealthDeepPingEvent["data"], msg: Message) {
    console.log(`${msg.getSequence()}: Processing "${msg.getSubject()}".`);
    console.log(`\tData: ${data.message}`);

    msg.ack();
  }
}

new StreamHealthListener(
  "teekeet-streaming-cluster", 
  "natsss-demo-stream", 
  "http://localhost:4222"
);