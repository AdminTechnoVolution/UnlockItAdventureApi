const { AsyncLocalStorage } = require('node:async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

module.exports = {
    run: (store, callback) => asyncLocalStorage.run(store, callback),
    get: () => asyncLocalStorage.getStore()
};
