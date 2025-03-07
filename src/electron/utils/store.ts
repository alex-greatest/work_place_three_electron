import Store from 'electron-store';
import path from 'path';

const schema = {
    comPort: { type: 'string', default: '' },
    port: {type: 'number', default: 0},
    ipAdress: {type: 'string', default: ''},
};

export interface StoreConfig {
    comPort: string;
}

let store: Store<StoreConfig>;

export function storeInitialize() {
    store = new Store<StoreConfig>({ schema, cwd: path.join("D:\\", '/settings') });
}

export function getComPort(): string {
    return store.get('comPort');
}

export function getPort(): number {
    return store.get('port');
}

export function getIpAdress(): string {
    return store.get('ipAdress');
}