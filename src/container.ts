import 'reflect-metadata';
import { v4 } from 'uuid';

import { ClassType } from './class.type';

type AliasType = (container: Container) => ClassType;

interface IRegister {
    [key: string]: {
        Target: ClassType;
        alias?: AliasType;
    };
}

interface IInstances {
    [key: string]: ClassType;
}

export const CONTAINER_ID = Symbol('CONTAINER_ID');
export const CONTAINER_CONTEXT = Symbol('CONTAINER_CONTEXT');

export class Container {
    private static context = new Container();

    public static add(target: ClassType) {
        if (!target[CONTAINER_ID]) {
            target[CONTAINER_ID] = v4();

            this.register[target[CONTAINER_ID]] = {
                Target: target,
            };
        }
    }

    public static getContext() {
        return this.context;
    }

    public static set(target: any, alias: any) {
        this.register[target[CONTAINER_ID]].alias = alias;
    }

    private static register: IRegister = {};

    private instances: IInstances = {};

    public get<T>(target: any): T {
        const instanceKey = target[CONTAINER_ID];

        if (!this.instances[instanceKey]) {
            const { alias, Target } = Container.register[instanceKey];
            const instance = alias ? alias(this) : new Target();

            this.instances[instanceKey] = instance;
            instance[CONTAINER_CONTEXT] = this;

            if (instance.init) {
                instance.init();
            }
        }

        return this.instances[instanceKey] as any;
    }

    public destroy() {
        this.instances = {};
    }
}
