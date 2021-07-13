import { Deserializer } from "@nestjs/microservices";
import { KafkaResponse } from "../interfaces";
export declare class KafkaResponseDeserializer implements Deserializer<any, KafkaResponse> {
    deserialize(message: any, options?: Record<string, any>): KafkaResponse;
}
