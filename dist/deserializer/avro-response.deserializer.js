"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaAvroResponseDeserializer = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const confluent_schema_registry_1 = require("@kafkajs/confluent-schema-registry");
const kafka_response_deserializer_1 = require("./kafka-response.deserializer");
class KafkaAvroResponseDeserializer {
    constructor(config, options) {
        this.logger = new logger_service_1.Logger(KafkaAvroResponseDeserializer.name);
        this.registry = new confluent_schema_registry_1.SchemaRegistry(config, options);
        this.fallback = new kafka_response_deserializer_1.KafkaResponseDeserializer();
    }
    async deserialize(message, options) {
        const { value, key, timestamp, offset } = message;
        const decodeResponse = {
            response: value,
            key,
            timestamp,
            offset,
        };
        try {
            decodeResponse.key = await this.registry.decode(message.key);
            decodeResponse.response = (message.value) ? await this.registry.decode(message.value) : message.value;
        }
        catch (e) {
            this.logger.error(e);
            const msg = this.fallback.deserialize(message);
            Object.assign(decodeResponse, msg);
        }
        return decodeResponse;
    }
}
exports.KafkaAvroResponseDeserializer = KafkaAvroResponseDeserializer;
//# sourceMappingURL=avro-response.deserializer.js.map