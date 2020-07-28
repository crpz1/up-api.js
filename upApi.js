const fetch = require("node-fetch");

async function makeRequest(endpoint, key) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.up.com.au/api/v1/${endpoint}`, {
            headers: {
                "Authorization": `Bearer ${key}`
            }
        }).then(async res => {
            if (!res.ok) throw Error;
            res.json().then(json => resolve(json));
        });
    });
}

class Account {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.displayName = data.attributes.displayName;
        this.accountType = data.attributes.accountType;
        this.createdAt = data.createdAt;
        this.balance = new Money(data.attributes.balance);
    }
};

class Transaction {
    constructor(data) {
        this.id = data.id;
        this.status = data.attributes.status;
        this.rawText = data.attributes.rawText;
        this.description = data.attributes.description;
        this.message = data.attributes.message;
        this.amount = new Money(data.attributes.amount);
        this.foreignAmount = data.attributes.foreignAmount ? new Money(data.attributes.foreignAmount) : null;
    }
};

class Money {
    constructor(data) {
        this.currencyCode = data.currencyCode;
        this.value = data.value;
    }
};

module.exports.Account = Account;
module.exports.Money = Money;
module.exports.Transaction = Transaction;

module.exports.Client = class Client {
    constructor(apiKey) {
        this.key = apiKey;
    }

    getAccounts() {
        return new Promise((resolve, reject) => {
            let out = [];
            makeRequest("accounts", this.key).then(res => {
                res.data.forEach(elem => {
                    out.push(new Account(elem));
                });
                resolve(out);
            });
        });
    }

    getAccountByID(id) {
        return new Promise((resolve, reject) => {
            makeRequest(`accounts/${id}`, this.key).then(res => {
                resolve(new Account(res.data));
            });
        });
    }

    getTransactions() {
        return new Promise((resolve, reject) => {
            let out = [];
            makeRequest("transactions", this.key).then(res => {
                res.data.forEach(elem => {
                    out.push(new Transaction(elem));
                });
                resolve(out);
            });
        });
    }

    getTransactionByID(id) {
        return new Promise((resolve, reject) => {
            makeRequest(`transactions/${id}`, this.key).then(res => {
                resolve(new Transaction(res.data));
            });
        });
    }
};