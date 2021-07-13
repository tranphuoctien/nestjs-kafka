import { Deserializer } from "@nestjs/microservices";
import { Logger } from '@nestjs/common/services/logger.service';
import { KafkaResponse } from "../interfaces";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { SchemaRegistryAPIClientOptions } from "@kafkajs/confluent-schema-registry/dist/@types";
import { KafkaResponseDeserializer } from "./kafka-response.deserializer";
export declare class KafkaAvroResponseDeserializer implements Deserializer<any, Promise<KafkaResponse>> {
    protected registry: SchemaRegistry;
    protected logger: Logger;
    protected fallback: KafkaResponseDeserializer;
    constructor(config: SchemaRegistryAPIClientArgs, options?: SchemaRegistryAPIClientOptions);
    deserialize(message: any, options?: Record<string, any>): Promise<KafkaResponse>;
}
