import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { Web3Service } from "../web3.service";

@Injectable()
export class T34 {
    web3: any;
    
    remoteKey = "0xa83b6b64dd4035aa732e3e7b83968873371fac2c84e8cbef08279cbccfdb3d64";
    password = "qwerty123456";

    defaultKey = "0x85ec9ddf1bcee6e71830506eaeb145dd161ff67a77fea84eb4e679ac01c8935c";
    defaultRecipient = "0x7982269a2CDA8B99813b1221D91a8360c7713C38";
    defaultEntropy = "12345678901234567890123456789012";

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.ganache();
    }

    /**
    Задача 1

    Напишите скрипт, который запрашивает закрытый ключ key, адрес recipient и value

    • создаёт новый аккаунт sender из key
    • пополняет баланс аккаунта sender с любого аккаунта из ganache
    • локально подписывает транзакцию отправки value с sender на recipient
    • отправляет подписанную транзакцию в сеть

    Запуск: npx nestjs-command t34:task1
    */
    @Command({
        command: 't34:task1',
        describe: 'Задача 34.1',
    })
    async T34_1() {
        const key:any = readline.question("Enter key: ") || this.defaultKey;
        const recipient:any = readline.question("Enter recipient: ") || this.defaultRecipient;
        const val:any = readline.question("Enter value: ") || 1_000_000_000_000_000_000;

        //console.log('readline: ', key, recipient, val);

        const remoteAccount = await this.web3.eth.personal.importRawKey(this.remoteKey, this.password);
        console.log('remoteAccount: ', remoteAccount);

        const sender = this.web3.eth.accounts.privateKeyToAccount(key);
        console.log('sender: ', sender);

        await this.web3.eth.getBalance(sender.address).then((balance) => {
            console.log('balance before transaction: ', balance);
        });

        await this.web3.eth.personal.sendTransaction({
            from: remoteAccount,
            to: sender.address,
            value: 2_000_000_000_000_000_000,
            gas: 53_000
        }, this.password)
        .then((txHash) => {
            console.log('txHash: ', txHash);
        });
        
        await this.web3.eth.getBalance(sender.address).then((balance) => {
            console.log('balance after transaction: ', balance);
        });

        const tx = await this.web3.eth.accounts.signTransaction({
            from: sender.address,
            to: recipient,
            value: val,
            gas: 21_000
        }, sender.privateKey);

        console.log('signTransaction: ', tx);

        await this.web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
    }

    /**
    Задача 2

    Напишите скрипт, который запрашивает закрытый 32 битную строку entropy, адрес recipient и value

    • создаёт новый аккаунт sender из entropy
    • создаёт кошелёк и добавляет в него sender 
    • пополняет баланс аккаунта sender с любого аккаунта из ganache
    • отправляет  value с sender на recipient, без локальной подписи транзакции

    Запуск: npx nestjs-command t34:task2
    */
    @Command({
        command: 't34:task2',
        describe: 'Задача 34.2',
    })
    async T34_2() {
        const entropy:any = readline.question("Enter entropy: ") || this.defaultEntropy;
        const recipient:any = readline.question("Enter recipient: ") || this.defaultRecipient;
        const val:any = readline.question("Enter value: ") || 1_000_000_000_000_000_000;

        const remoteAccount = await this.web3.eth.personal.importRawKey(this.remoteKey, this.password);
        console.log('remoteAccount: ', remoteAccount);

        const sender = this.web3.eth.accounts.create(entropy);
        console.log('sender: ', sender);

        await this.web3.eth.getBalance(sender.address).then((balance) => {
            console.log('balance before transaction: ', balance);
        });

        await this.web3.eth.personal.sendTransaction({
            from: remoteAccount,
            to: sender.address,
            value: 2_000_000_000_000_000_000,
            gas: 53_000
        }, this.password)
        .then((txHash) => {
            console.log('txHash: ', txHash);
        });
        
        await this.web3.eth.getBalance(sender.address).then((balance) => {
            console.log('balance after transaction: ', balance);
        });

        const tx = await this.web3.eth.accounts.signTransaction({
            from: sender.address,
            to: recipient,
            value: val,
            gas: 21_000
        }, sender.privateKey);

        console.log('signTransaction: ', tx);

        await this.web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
    }

    /**
    Задача 3

    Напишите скрипт, который запрашивает закрытый 32 битную строку key, и пароль password адрес recipient и value

    • создаёт новый аккаунт sender из key и password на удалённом узле
    • пополняет баланс аккаунта sender с любого аккаунта из ganache
    • отправляет  value с sender на recipient, без локальной подписи транзакции
    • разблокирует sender 
    • отправляет  value с sender на recipient
    • блокирует sender

    Запуск: npx nestjs-command t34:task3
    */
    @Command({
        command: 't34:task3',
        describe: 'Задача 34.3',
    })
    async T34_3() {
        const key:any = readline.question("Enter key: ");
        const password:any = readline.question("Enter password: ");
        const recipient:any = readline.question("Enter recipient: ") || this.defaultRecipient;
        const val:any = readline.question("Enter value: ") || 1_000_000_000_000_000_000;

        const remoteAccount = await this.web3.eth.personal.importRawKey(this.remoteKey, this.password);
        console.log('remoteAccount: ', remoteAccount);

        const sender = await this.web3.eth.personal.importRawKey(key, password);
        console.log('sender: ', sender);

        await this.web3.eth.personal.sendTransaction({
            from: remoteAccount,
            to: sender,
            value: 2_000_000_000_000_000_000,
            gas: 53_000
        }, this.password)
        .then((txHash) => {
            console.log('txHash remoteAccount: ', txHash);
        });

        await this.web3.eth.personal.unlockAccount(sender, password, 10000).then(console.log('Account unlocked!'));

        await this.web3.eth.sendTransaction({
            from: sender,
            to: recipient,
            value: val,
            gas: 53_000
        })
        .then((txHash) => {
            console.log('txHash sender: ', txHash);
        });

        await this.web3.eth.personal.lockAccount(sender).then(console.log('Account locked!'));
    }

    /**
    Задача 4

    Напишите скрипт, который запрашивает пароль password адрес recipient и value

    • создаёт новый аккаунт sender используя password на удалённом узле
    • пополняет баланс аккаунта sender с любого аккаунта из ganache
    • отправляет  value с sender на recipient, без локальной подписи транзакции
    • отправляет  value с sender на recipient, без предварительной разблокировки

    Запуск: npx nestjs-command t34:task4
    */
    @Command({
        command: 't34:task4',
        describe: 'Задача 34.4',
    })
    async T34_4() {
        const key:any = readline.question("Enter key: ");
        const password:any = readline.question("Enter password: ");
        const recipient:any = readline.question("Enter recipient: ") || this.defaultRecipient;
        const val:any = readline.question("Enter value: ") || 1_000_000_000_000_000_000;

        const remoteAccount = await this.web3.eth.personal.importRawKey(this.remoteKey, this.password);
        console.log('remoteAccount: ', remoteAccount);

        const sender = await this.web3.eth.personal.importRawKey(key, password);
        console.log('sender: ', sender);

        await this.web3.eth.personal.sendTransaction({
            from: remoteAccount,
            to: sender,
            value: 2_000_000_000_000_000_000,
            gas: 53_000
        }, this.password)
        .then((txHash) => {
            console.log('txHash remoteAccount: ', txHash);
        });

        await this.web3.eth.personal.sendTransaction({
            from: sender,
            to: recipient,
            value: val,
            gas: 53_000
        }, password)
        .then((txHash) => {
            console.log('txHash sender: ', txHash);
        });
    }
}