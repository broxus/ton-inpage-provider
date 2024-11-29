import type { Provider } from './index';

declare global {
    interface Window {
        __ever: Provider | undefined;
        __sparx: Provider | undefined;
        __hasEverscaleProvider: boolean | undefined;
    }
}

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const ensurePageLoaded = !isBrowser || document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>(resolve => window.addEventListener('load', () => resolve()));

/**
 * Interface representing a provider adapter.
 * This interface defines the methods required to interact with a provider.
 * @category Provider
 */
export interface ProviderAdapter {
    /**
     * Retrieves the provider instance.
     */
    getProvider(): Promise<Provider | undefined> | Provider | undefined;

    /**
     * Checks if a provider is available.
     */
    hasProvider(): Promise<boolean> | boolean;
}

/**
 * @category Provider
 */
export function hasEverscaleProvider(): Promise<boolean> {
    if (!isBrowser) return Promise.resolve(false);
    return ensurePageLoaded.then(() => window.__hasEverscaleProvider === true);
}

/**
 * A static implementation of the `ProviderAdapter` interface that wraps a given provider instance or a promise that resolves to a provider.
 * This adapter always indicates the presence of a provider.
 * @category Provider
 */
export class StaticProviderAdapter implements ProviderAdapter {
    private readonly _provider: Promise<Provider> | Provider;

    constructor(provider: Promise<Provider> | Provider) {
        this._provider = provider;
    }

    public getProvider(): Promise<Provider> | Provider {
        return this._provider;
    }

    public hasProvider(): boolean {
        return true;
    }
}

/**
 * An implementation of the `ProviderAdapter` interface that wraps Ever Wallet provider.
 * @category Provider
 */
export class EverscaleProviderAdapter implements ProviderAdapter {
    public async getProvider(): Promise<Provider | undefined> {
        if (!(await this.hasProvider())) return;

        return new Promise<Provider | undefined>((resolve) => {
            if (window.__ever) {
                resolve(window.__ever);
            } else {
                window.addEventListener(
                    'ever#initialized',
                    _ => resolve(window.__ever),
                    { once: true },
                );
            }
        });
    }

    public hasProvider(): Promise<boolean> {
        return hasEverscaleProvider();
    }
}

/**
 * An implementation of the `ProviderAdapter` interface that wraps Sparx provider.
 * @category Provider
 */
export class SparxProviderAdapter implements ProviderAdapter {
    public async getProvider(): Promise<Provider | undefined> {
        if (!(await this.hasProvider())) return;

        return new Promise<Provider | undefined>((resolve) => {
            if (window.__sparx) {
                resolve(window.__sparx);
            } else {
                window.addEventListener(
                    'sparx#initialized',
                    _ => resolve(window.__sparx),
                    { once: true },
                );
            }
        });
    }

    public hasProvider(): Promise<boolean> {
        return hasEverscaleProvider();
    }
}

export function isProviderAdapter(value: any): value is ProviderAdapter {
    return !!value && 'getProvider' in value && 'hasProvider' in value;
}
