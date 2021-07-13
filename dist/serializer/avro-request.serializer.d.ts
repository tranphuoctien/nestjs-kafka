import { Serializer } from "@nestjs/microservices";
import { Logger } from '@nestjs/common/services/logger.service';
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { SchemaRegistryAPIClientOptions } from "@kafkajs/confluent-schema-registry/dist/@types";
import { KafkaMessageSend } from "../interfaces";
declare type KafkaAvroRequestSerializerSchema = {
    topic: string;
    key?: string;
    value?: string;
    keySuffix?: string;
    valueSuffix?: string;
};
export declare type KafkaAvroRequestSerializerConfig = {
    schemas: KafkaAvroRequestSerializerSchema[];
    config: SchemaRegistryAPIClientArgs;
    options: SchemaRegistryAPIClientOptions;
    schemaSeparator?: string;
    schemaFetchIntervalSeconds?: number;
};
interface KafkaSchemaMap {
    keyId: number | null;
    valueId: number;
    keySuffix: string;
    valueSuffix: string;
}
export declare class KafkaAvroRequestSerializer implements Serializer<KafkaMessageSend, Promise<KafkaMessageSend>> {
    protected registry: SchemaRegistry;
    protected logger: Logger;
    protected schemas: Map<string, KafkaSchemaMap>;
    protected separator: string;
    protected config: KafkaAvroRequestSerializerConfig;
    private lastSchemaFetchInterval;
    constructor(options: KafkaAvroRequestSerializerConfig);
    private getSchemaIds;
    private getSchemaId;
    private updateSchemas;
    serialize(value: KafkaMessageSend): Promise<KafkaMessageSend>;
}
export {};
