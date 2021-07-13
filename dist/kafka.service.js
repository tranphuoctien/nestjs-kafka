"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const logger_service_1 = require("@nestjs/common/services/logger.service");
const kafka_logger_1 = require("@nestjs/microservices/helpers/kafka-logger");
const kafka_response_deserializer_1 = require("./deserializer/kafka-response.deserializer");
const kafka_request_serializer_1 = require("./serializer/kafka-request.serializer");
const kafka_decorator_1 = require("./kafka.decorator");
let KafkaService = KafkaService_1 = class KafkaService {
    constructor(options) {
        var _a;
        this.topicOffsets = new Map();
        this.logger = new logger_service_1.Logger(KafkaService_1.name);
        const { client, consumer: consumerConfig, producer: producerConfig, } = options;
        this.kafka = new kafkajs_1.Kafka(Object.assign(Object.assign({}, client), { logCreator: kafka_logger_1.KafkaLogger.bind(null, this.logger) }));
        const { groupId } = consumerConfig;
        const consumerOptions = Object.assign({
            groupId: this.getGroupIdSuffix(groupId),
        }, consumerConfig);
        this.autoConnect = (_a = options.autoConnect) !== null && _a !== void 0 ? _a : true;
        this.consumer = this.kafka.consumer(consumerOptions);
        this.producer = this.kafka.producer(producerConfig);
        this.admin = this.kafka.admin();
        this.initializeDeserializer(options);
        this.initializeSerializer(options);
        this.options = options;
    }
    async onModuleInit() {
        await this.connect();
        await this.getTopicOffsets();
        kafka_decorator_1.SUBSCRIBER_MAP.forEach((functionRef, topic) => {
            this.subscribe(topic);
        });
        this.bindAllTopicToConsumer();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        if (!this.autoConnect) {
            return;
        }
        await this.producer.connect();
        await this.consumer.connect();
        await this.admin.connect();
    }
    async disconnect() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
        await this.admin.disconnect();
    }
    async getTopicOffsets() {
        var e_1, _a;
        const topics = kafka_decorator_1.SUBSCRIBER_MAP.keys();
        try {
            for (var topics_1 = __asyncValues(topics), topics_1_1; topics_1_1 = await topics_1.next(), !topics_1_1.done;) {
                const topic = topics_1_1.value;
                try {
                    const topicOffsets = await this.admin.fetchTopicOffsets(topic);
                    this.topicOffsets.set(topic, topicOffsets);
                }
                catch (e) {
                    this.logger.error('Error fetching topic offset: ', topic);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (topics_1_1 && !topics_1_1.done && (_a = topics_1.return)) await _a.call(topics_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    async subscribe(topic) {
        await this.consumer.subscribe({
            topic,
            fromBeginning: this.options.consumeFromBeginning || false
        });
    }
    async send(message) {
        if (!this.producer) {
            this.logger.error('There is no producer, unable to send message.');
            return;
        }
        const serializedPacket = await this.serializer.serialize(message);
        return await this.producer.send(serializedPacket);
    }
    getGroupIdSuffix(groupId) {
        return groupId + '-client';
    }
    subscribeToResponseOf(topic, instance) {
        kafka_decorator_1.SUBSCRIBER_OBJECT_MAP.set(topic, instance);
    }
    async transaction() {
        const producer = this.producer;
        if (!producer) {
            const msg = 'There is no producer, unable to start transactions.';
            this.logger.error(msg);
            throw msg;
        }
        const tx = await producer.transaction();
        const retval = {
            abort() {
                return tx.abort();
            },
            commit() {
                return tx.commit();
            },
            isActive() {
                return tx.isActive();
            },
            async send(message) {
                const serializedPacket = await this.serializer.serialize(message);
                return await tx.send(serializedPacket);
            },
            sendOffsets(offsets) {
                return tx.sendOffsets(offsets);
            },
        };
        return retval;
    }
    async commitOffsets(topicPartitions) {
        return this.consumer.commitOffsets(topicPartitions);
    }
    initializeSerializer(options) {
        this.serializer = (options && options.serializer) || new kafka_request_serializer_1.KafkaRequestSerializer();
    }
    initializeDeserializer(options) {
        this.deserializer = (options && options.deserializer) || new kafka_response_deserializer_1.KafkaResponseDeserializer();
    }
    bindAllTopicToConsumer() {
        const runConfig = (this.options.consumerRunConfig) ? this.options.consumerRunConfig : {};
        this.consumer.run(Object.assign(Object.assign({}, runConfig), { eachMessage: async ({ topic, partition, message }) => {
                const objectRef = kafka_decorator_1.SUBSCRIBER_OBJECT_MAP.get(topic);
                const callback = kafka_decorator_1.SUBSCRIBER_MAP.get(topic);
                try {
                    const { timestamp, response, offset, key } = await this.deserializer.deserialize(message, { topic });
                    await callback.apply(objectRef, [response, key, offset, timestamp, partition]);
                }
                catch (e) {
                    this.logger.error(`Error for message ${topic}: ${e}`);
                    throw e;
                }
            } }));
        if (this.options.seek !== undefined) {
            this.seekTopics();
        }
    }
    seekTopics() {
        Object.keys(this.options.seek).forEach((topic) => {
            const topicOffsets = this.topicOffsets.get(topic);
            const seekPoint = this.options.seek[topic];
            topicOffsets.forEach((topicOffset) => {
                let seek = String(seekPoint);
                if (typeof seekPoint == 'object') {
                    const time = seekPoint;
                    seek = time.getTime().toString();
                }
                if (seekPoint === 'earliest') {
                    seek = topicOffset.low;
                }
                this.consumer.seek({
                    topic,
                    partition: topicOffset.partition,
                    offset: seek
                });
            });
        });
    }
};
KafkaService = KafkaService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], KafkaService);
exports.KafkaService = KafkaService;
//# sourceMappingURL=kafka.service.js.map