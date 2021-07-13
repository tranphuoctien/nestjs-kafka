import { KafkaModuleOption } from '.';
export declare class KafkaModuleOptionsProvider {
    private readonly kafkaModuleOptions;
    constructor(kafkaModuleOptions: KafkaModuleOption[]);
    getOptionsByName(name: string): {
        client: import("kafkajs").KafkaConfig;
        consumer: import("kafkajs").ConsumerConfig;
        consumerRunConfig?: import("kafkajs").ConsumerRunConfig;
        producer?: import("kafkajs").ProducerConfig;
        deserializer?: import("@nestjs/microservices").Deserializer<any, any>;
        serializer?: import("@nestjs/microservices").Serializer<any, any>;
        consumeFromBeginning?: boolean;
        seek?: Record<string, number | Date | "earliest">;
        autoConnect?: boolean;
    };
}
