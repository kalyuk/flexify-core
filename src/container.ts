import { v4 } from 'uuid';

export type CacheType<T> = {
    instance: T & { init?: () => void },
}

export type ContainerClassType<T> = { new(): T };

export const CONTEXT = Symbol('CONTEXT');

function isClass(v: any) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

export class Container {

    private ID = Symbol('ID')

    private cache = new Map<string, CacheType<any>>()
    private aliases = new Map<string, any>();

    getId(Target: any) {
        if (!Target[this.ID]) {
            Target[this.ID] = v4();
        }

        return Target[this.ID];
    }

    set(Target: any, Value: any) {
        const id = this.getId(Target);
        this.aliases.set(id, Value);
    }

    get<T>(Target: ContainerClassType<T>): T {
        const id = this.getId(Target);

        if (!this.cache.has(id)) {
            this.createInstance(Target);
        }

        return this.cache.get(id).instance;
    }

    createInstance<T>(Target: ContainerClassType<T>) {
        const id = this.getId(Target);
        const alias = this.aliases.get(id);
        const options: CacheType<T> = {
            instance: alias ?
                isClass(alias) ? new alias() : alias(this)
                : new Target()
        }
        options.instance[CONTEXT] = this;

        if (typeof options.instance.init === 'function') {
            options.instance.init();
        }

        this.cache.set(id, options);
    }

    reCreateInstance<T>(Target: ContainerClassType<T>) {
        const id = this.getId(Target);
        this.cache.get(id).instance = null;
        this.cache.delete(id);
    }
}
