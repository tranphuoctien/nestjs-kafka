"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaResponseDeserializer = void 0;
class KafkaResponseDeserializer {
    deserialize(message, options) {
        const { key, value, timestamp, offset } = message;
        let id = key;
        let response = value;
        if (Buffer.isBuffer(key)) {
            id = Buffer.from(key).toString();
        }
        if (Buffer.isBuffer(value)) {
            response = Buffer.from(value).toString();
        }
        return {
            key: id,
            response,
            timestamp,
            offset
        };
    }
}
exports.KafkaResponseDeserializer = KafkaResponseDeserializer;
//# sourceMappingURL=kafka-response.deserializer.js.map