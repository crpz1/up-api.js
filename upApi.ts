import fetch from 'node-fetch';

class RESTClient {
    #key: string;

    constructor(token: string) {
        this.#key = token;
    }

    makeRequest(endpoint: string) {
        return new Promise<any>((resolve, reject) => {
            fetch(`https://api.up.com.au/api/v1/${endpoint}`, {
                headers: {
                    "Authorization": `Bearer ${this.#key}`
                }
            }).then(res => {
                if (!res.ok) {
                    res.json().then(err => {
                        reject(err.errors[0].detail);
                    });
                } else {
                    res.json().then(json => resolve(json));
                }
            });
        });
    }
}

export class Account {
    id: string;
    type: string;
    displayName: string;
    accountType: string;
    createdAt: string;
    balance: Money;
    #restClient?: RESTClient;

    constructor(data: any, client: RESTClient) {
        this.id = data.id;
        this.type = data.type;
        this.displayName = data.attributes.displayName;
        this.accountType = data.attributes.accountType;
        this.createdAt = data.createdAt;
        this.balance = new Money(data.attributes.balance);
        this.#restClient = client;
    }

    getTransactions() {
        return new Promise<Transaction[]>((resolve, reject) => {
            let out = [];
            this.#restClient.makeRequest(`accounts/${this.id}/transactions`).then(res => {
                res.data.forEach(elem => {
                    out.push(new Transaction(elem));
                }).catch(err => reject(err));;
                resolve(out);
            });
        });
    }
};

export class Transaction {
    id: string;
    status: string;
    rawText: string;
    description: string;
    message: string;
    amount: Money;
    foreignAmount?: Money;

    constructor(data: any) {
        this.id = data.id;
        this.status = data.attributes.status;
        this.rawText = data.attributes.rawText;
        this.description = data.attributes.description;
        this.message = data.attributes.message;
        this.amount = new Money(data.attributes.amount);
        this.foreignAmount = data.attributes.foreignAmount ? new Money(data.attributes.foreignAmount) : null;
    }
};

export class Money {
    currencyCode: string;
    value: number;
    
    constructor(data: any) {
        this.currencyCode = data.currencyCode;
        this.value = data.value;
    }
};

export class Client {
    #restClient: RESTClient;

    constructor(apiKey: string) {
        this.#restClient = new RESTClient(apiKey);
    }

    getAccounts() {
        return new Promise<Account[]>((resolve, reject) => {
            let out = [];
            this.#restClient.makeRequest("accounts").then(res => {
                res.data.forEach(elem => {
                    out.push(new Account(elem, this.#restClient));
                }).catch(err => reject(err));
                resolve(out);
            });
        });
    }

    getAccountByID(id: string) {
        return new Promise<Account>((resolve, reject) => {
            this.#restClient.makeRequest(`accounts/${id}`).then(res => {
                resolve(new Account(res.data, this.#restClient));
            }).catch(err => reject(err));;
        });
    }

    getTransactions() {
        return new Promise<Transaction[]>((resolve, reject) => {
            let out = [];
            this.#restClient.makeRequest("transactions").then(res => {
                res.data.forEach(elem => {
                    out.push(new Transaction(elem));
                }).catch(err => reject(err));;
                resolve(out);
            });
        });
    }

    getTransactionByID(id: string) {
        return new Promise<Transaction>((resolve, reject) => {
            this.#restClient.makeRequest(`transactions/${id}`).then(res => {
                resolve(new Transaction(res.data));
            }).catch(err => reject(err));;
        });
    }
};
