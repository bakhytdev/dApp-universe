import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { ethers } from "ethers";
import { EthersService } from "../ethers.service";

@Injectable()
export class T54 {

    defaultKeys = [
        "0xeb5ffef72b654c8ea8e459e11f90ece88e31638a92585960e513dd8a0bd570f3",
        "0x19a897f82eab3f0d94d9636c4a608ccd36d4240f141c114a2179d2142f2f8f63"
    ];

    defaultAdrs = [
        "0x19099DE387309DdA8e9bd4D633A53AbeA3423Fe9"
    ]

    constructor(
        private readonly ethersService: EthersService
    ) {}

    /**
    Задача 1
    Напишите скрипт, который принимает на вход строку для энтропии, создаёт нового подписанта и выводит в терминал его адрес и приватный ключ

    Запуск: npx nestjs-command t54:task1
    */
    @Command({
        command: 't54:task1',
        describe: 'Задача 54.1',
    })
    async T54_1() {
        const entropy = readline.question(`Enter entropy: `);
        const signer = ethers.Wallet.createRandom(entropy);

        console.log('address: ', signer.address);
        console.log('privateKey: ', signer.privateKey);

        process.exit();
    }

    /**
    Задача 2
    Напишите скрипт, который принимает на закрытый ключ, создаёт нового подписанта и выводит в терминал его адрес и публичный ключ

    Запуск: npx nestjs-command t54:task2
    */
    @Command({
        command: 't54:task2',
        describe: 'Задача 54.2',
    })
    async T54_2() {
        const privateKey = readline.question(`Enter privateKey: `) || this.defaultKeys[0];
        const signer = new ethers.Wallet(privateKey);

        console.log('address: ', signer.address);
        console.log('privateKey: ', signer.privateKey);

        process.exit();
    }

    /**
    Задача 3
    Напишите скрипт, который принимает ендпоинт узла (https://…) создаёт RpcProvider, получает список подписантов, управляемых узлом и выводит их в консоль

    Запуск: npx nestjs-command t54:task3
    */
    @Command({
        command: 't54:task3',
        describe: 'Задача 54.3',
    })
    async T54_3() {
        const endpoint = readline.question(`Enter endpoint: `) || this.ethersService.getGanacheHost();
        const provider = new ethers.JsonRpcProvider(endpoint);

        console.log('Accounts: ', (await provider.listAccounts()).map(item => item.address));

        process.exit();
    }

    /**
    Задача 4
    Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value
        • создаёт нового подписанта signer из privateKey
        • создаёт нового провайдера provider подключённого к ganache
        • пополняет баланс аккаунта signer с любого аккаунта из ganache
        • отправляет value с баланса signer на баланс  recipient

    Запуск: npx nestjs-command t54:task4
    */
    @Command({
        command: 't54:task4',
        describe: 'Задача 54.4',
    })
    async T54_4() {
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
        const privateKey = readline.question(`Enter privateKey: `) || this.defaultKeys[0];
        const recepient = readline.question(`Enter recepient address: `) || this.defaultAdrs[0];
        const value = readline.question(`Enter value: `) || ethers.toBigInt('1000000000000000000');

        const signer = new ethers.Wallet(privateKey);
        const account = new ethers.Wallet(this.defaultKeys[1]);

        const signerConnect = signer.connect(provider);
        const accountConnect = account.connect(provider);

        const txRequestToSigner = await accountConnect.populateTransaction({
            to: signerConnect.address,
            value
        });

        (await accountConnect.sendTransaction(txRequestToSigner)).wait().then(console.log);

        const txRequesttoRecepient = await signerConnect.populateTransaction({
            to: recepient,
            value
        });

        (await signerConnect.sendTransaction(txRequesttoRecepient)).wait().then(console.log);
    }

    /**
    Задача 5
    Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value
        • создаёт нового подписанта signer из privateKey
        • создаёт нового провайдера provider подключённого к тестовой сети Goerli
        • локально подписывает транзакцию отправки value с баланса signer на баланс  recipient
        • отправляет подписанную транзакцию в сеть с использование провайдера

    Запуск: npx nestjs-command t54:task5
    */
    @Command({
        command: 't54:task5',
        describe: 'Задача 54.5',
    })
    async T54_5() {
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGoerliHost());
        const privateKey = readline.question(`Enter privateKey: `) || this.defaultKeys[0];
        const recepient = readline.question(`Enter recepient address: `) || this.defaultAdrs[0];
        const value = readline.question(`Enter value: `) || ethers.toBigInt('1000000000000000000');

        const signer = new ethers.Wallet(privateKey);
        const signerConnect = signer.connect(provider);

        const txRequest = await signerConnect.populateTransaction({
            to: recepient,
            value
        });

        const txSigned = await signerConnect.signTransaction(txRequest);

        await (await provider.broadcastTransaction(txSigned)).wait().then(console.log);
    }

    /**
    Задача 6
    Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value

        • создаёт нового подписанта signer из privateKey
        • создаёт нового провайдера provider подключённого к тестовой сети Goerli
        • отправляет value с баланса signer на баланс  recipient
        • для отправки транзакции используйте метод подписанта

    Запуск: npx nestjs-command t54:task6
    */
    @Command({
        command: 't54:task6',
        describe: 'Задача 54.6',
    })
    async T54_6() {
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGoerliHost());
        const privateKey = readline.question(`Enter privateKey: `) || this.defaultKeys[0];
        const recepient = readline.question(`Enter recepient address: `) || this.defaultAdrs[0];
        const value = readline.question(`Enter value: `) || ethers.toBigInt('1000000000000000000');

        const signer = new ethers.Wallet(privateKey);
        const signerConnect = signer.connect(provider);

        const txRequest = await signerConnect.populateTransaction({
            to: recepient,
            value
        });

        await (await signerConnect.sendTransaction(txRequest)).wait().then(console.log);
    }
}