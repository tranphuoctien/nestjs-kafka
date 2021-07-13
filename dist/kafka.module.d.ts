import { DynamicModule } from '@nestjs/common';
import { KafkaModuleOption, KafkaModuleOptionsAsync } from './interfaces';
export declare class KafkaModule {
    static register(options: KafkaModuleOption[]): DynamicModule;
    static registerAsync(consumers: string[], connectOptions: KafkaModuleOptionsAsync): DynamicModule;
    private static createKafkaModuleOptionsProvider;
}
