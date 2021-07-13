import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { RecordMetadata, SeekEntry, TopicPartitionOffsetAndMetadata } from 'kafkajs';
import { Logger } from "@nestjs/common/services/logger.service";
import { KafkaModuleOption, KafkaMessageSend, KafkaTransaction } from './interfaces';
export declare class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka;
    private producer;
    private consumer;
    private admin;
    private deserializer;
    private serializer;
    private autoConnect;
    private options;
    protected topicOffsets: Map<string, (SeekEntry & {
        high: string;
        low: string;
    })[]>;
    protected logger: Logger;
    constructor(options: KafkaModuleOption['options']);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private getTopicOffsets;
    private subscribe;
    send(message: KafkaMessageSend): Promise<RecordMetadata[]>;
    getGroupIdSuffix(groupId: string): string;
    subscribeToResponseOf<T>(topic: string, instance: T): void;
    transaction(): Promise<KafkaTransaction>;
    commitOffsets(topicPartitions: Array<TopicPartitionOffsetAndMetadata>): Promise<void>;
    protected initializeSerializer(options: KafkaModuleOption['options']): void;
    protected initializeDeserializer(options: KafkaModuleOption['options']): void;
    private bindAllTopicToConsumer;
    private seekTopics;
}
