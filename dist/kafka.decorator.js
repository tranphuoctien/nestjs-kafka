"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeTo = exports.SCHEMAS = exports.SUBSCRIBER_OBJECT_MAP = exports.SUBSCRIBER_MAP = void 0;
exports.SUBSCRIBER_MAP = new Map();
exports.SUBSCRIBER_OBJECT_MAP = new Map();
exports.SCHEMAS = new Map();
function SubscribeTo(topic) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = target[propertyKey];
        exports.SUBSCRIBER_MAP.set(topic, originalMethod);
        return descriptor;
    };
}
exports.SubscribeTo = SubscribeTo;
//# sourceMappingURL=kafka.decorator.js.map