"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaAvroRequestSerializer = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const confluent_schema_registry_1 = require("@kafkajs/confluent-schema-registry");
class KafkaAvroRequestSerializer {
    constructor(options) {
        this.logger = new logger_service_1.Logger(KafkaAvroRequestSerializer.name);
        this.schemas = new Map();
        this.lastSchemaFetchInterval = new Map();
        this.registry = new confluent_schema_registry_1.SchemaRegistry(options.config, options.options);
        this.config = Object.assign({ schemaFetchIntervalSeconds: 3600 }, options);
        this.getSchemaIds();
    }
    async getSchemaIds() {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(this.config.schemas.values()), _c; _c = await _b.next(), !_c.done;) {
                const schema = _c.value;
                await this.getSchemaId(schema);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    async getSchemaId(schema) {
        var _a, _b;
        const keySuffix = (_a = schema.keySuffix) !== null && _a !== void 0 ? _a : 'key';
        const valueSuffix = (_b = schema.valueSuffix) !== null && _b !== void 0 ? _b : 'value';
        try {
            const keyId = await this.registry.getLatestSchemaId(`${schema.topic}-${keySuffix}`) || null;
            const valueId = await this.registry.getLatestSchemaId(`${schema.topic}-${valueSuffix}`);
            this.schemas.set(schema.topic, {
                keyId,
                valueId,
                keySuffix,
                valueSuffix,
            });
            this.lastSchemaFetchInterval.set(schema.topic, Date.now());
        }
        catch (e) {
            this.logger.error('Unable to get schema ID: ', e);
            throw e;
        }
    }
    async updateSchemas(topic) {
        const lastCheck = this.lastSchemaFetchInterval.get(topic);
        const configCheckMs = this.config.schemaFetchIntervalSeconds / 1000;
        const now = Date.now();
        if ((lastCheck + configCheckMs) > now) {
            const config = this.config.schemas.find((schema) => schema.topic === topic);
            await this.getSchemaId(config);
        }
    }
    async serialize(value) {
        const outgoingMessage = value;
        try {
            await this.updateSchemas(value.topic);
            const schema = this.schemas.get(value.topic);
            const { keyId, valueId } = schema;
            const messages = value.messages.map(async (origMessage) => {
                let encodedKey = origMessage.key;
                const encodedValue = await this.registry.encode(valueId, origMessage.value);
                if (keyId) {
                    encodedKey = await this.registry.encode(keyId, origMessage.key);
                }
                return Object.assign(Object.assign({}, origMessage), { value: encodedValue, key: encodedKey });
            });
            const results = await Promise.all(messages);
            outgoingMessage.messages = results;
        }
        catch (e) {
            this.logger.error('Error serializing', e);
            throw e;
        }
        return outgoingMessage;
    }
}
exports.KafkaAvroRequestSerializer = KafkaAvroRequestSerializer;
//# sourceMappingURL=avro-request.serializer.js.map