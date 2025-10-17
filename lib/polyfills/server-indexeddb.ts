const STORE_REGISTRY = new Map<string, Map<string, Map<string, any>>>();

type RequestCallback = (event?: { target: any }) => void;

interface FakeRequest<T = unknown> {
  result: T | undefined;
  error?: unknown;
  onsuccess?: RequestCallback;
  onerror?: RequestCallback;
  oncomplete?: RequestCallback;
}

interface FakeTransaction {
  objectStore: (storeName: string) => FakeObjectStore;
  oncomplete?: RequestCallback;
  onsuccess?: RequestCallback;
  onerror?: RequestCallback;
}

interface FakeObjectStore {
  transaction: FakeTransaction;
  get: (key: string) => FakeRequest;
  put: (value: unknown, key: string) => FakeRequest;
  delete: (key: string) => FakeRequest;
  clear: () => FakeRequest;
  getAllKeys: () => FakeRequest<string[]>;
  getAll: () => FakeRequest<unknown[]>;
}

function schedule(fn: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function createRequest<T>(executor: (resolve: (value: T) => void, reject: (error: unknown) => void) => void): FakeRequest<T> {
  const request: FakeRequest<T> = {
    result: undefined
  };

  executor(
    (value) => {
      request.result = value;
      schedule(() => {
        request.onsuccess?.({ target: request });
        request.oncomplete?.({ target: request });
      });
    },
    (error) => {
      request.error = error;
      schedule(() => {
        request.onerror?.({ target: request });
      });
    }
  );

  return request;
}

function createTransaction(store: Map<string, unknown>): FakeTransaction {
  const transaction: FakeTransaction = {} as FakeTransaction;

  const triggerComplete = () => {
    schedule(() => {
      transaction.oncomplete?.({ target: transaction });
      transaction.onsuccess?.({ target: transaction });
    });
  };

  const objectStore: FakeObjectStore = {
    transaction,
    get(key: string) {
      return createRequest((resolve) => resolve(store.get(key)));
    },
    put(value: unknown, key: string) {
      return createRequest((resolve) => {
        store.set(key, value);
        triggerComplete();
        resolve(undefined);
      });
    },
    delete(key: string) {
      return createRequest((resolve) => {
        store.delete(key);
        triggerComplete();
        resolve(undefined);
      });
    },
    clear() {
      return createRequest((resolve) => {
        store.clear();
        triggerComplete();
        resolve(undefined);
      });
    },
    getAllKeys() {
      return createRequest<string[]>((resolve) => resolve(Array.from(store.keys())));
    },
    getAll() {
      return createRequest<unknown[]>((resolve) => resolve(Array.from(store.values())));
    }
  };

  transaction.objectStore = () => objectStore;
  return transaction;
}

function ensureDatabase(dbName: string) {
  if (!STORE_REGISTRY.has(dbName)) {
    STORE_REGISTRY.set(dbName, new Map());
  }
  return STORE_REGISTRY.get(dbName)!;
}

function openDatabase(dbName: string) {
  const stores = ensureDatabase(dbName);

  const request: FakeRequest<any> & { onupgradeneeded?: RequestCallback } = {
    result: undefined
  };

  const database = {
    createObjectStore: (storeName: string) => {
      if (!stores.has(storeName)) {
        stores.set(storeName, new Map());
      }
      return {};
    },
    transaction: (storeName: string) => {
      if (!stores.has(storeName)) {
        stores.set(storeName, new Map());
      }
      const store = stores.get(storeName)!;
      return createTransaction(store);
    }
  };

  request.result = database;

  schedule(() => {
    request.onupgradeneeded?.({ target: request });
    request.onsuccess?.({ target: request });
    request.oncomplete?.({ target: request });
  });

  return request;
}

function installFakeIndexedDb() {
  if (typeof globalThis.indexedDB !== "undefined") {
    return;
  }

  const fakeIndexedDb = {
    open: openDatabase
  };

  Object.defineProperty(globalThis, "indexedDB", {
    value: fakeIndexedDb,
    writable: false,
    configurable: false
  });
}

if (typeof window === "undefined") {
  installFakeIndexedDb();
}
