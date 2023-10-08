import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { Web3Service } from "../web3.service";

@Injectable()
export class T31 {
    web3: any;

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.alchemy();
    }
    
    /**
    Задача 1

    Напишите скрипт, который принимает на вход строку для энтропии, создаёт новый аккаунт и выводит в терминал адрес и приватный ключ созданного аккаунта

    Запуск: npx nestjs-command t31:task1
    */
    @Command({
        command: 't31:task1',
        describe: 'Задача 31.1',
    })
    async T31_1() {
        const entropy:any = readline.question("Enter entropy: ");
        const account = await this.web3.eth.accounts.create(entropy);

        console.log(`address: ${account.address}`);
        console.log(`privateKey: ${account.privateKey}`);
    }

    /**
    Задача 2

    Напишите скрипт, который принимает на вход три строки для энтропии, создаёт три новых аккаунта, добавляет их в кошелёк и выводит в терминал созданный кошелёк

    Запуск: npx nestjs-command t31:task2
    */
    @Command({
        command: 't31:task2',
        describe: 'Задача 31.2',
    })
    async T31_2() {
        const wallet = this.web3.eth.accounts.wallet.create();

        for (let i = 1; i <= 3; i++) {
            const entropy:any = readline.question(`Enter entropy for account ${i}: `);

            wallet.add(this.web3.eth.accounts.create(entropy));
        }

        console.log(wallet);
    }

    /**
    Задача 3

    Дополните предыдущую задачу. Закодируйте содержимое кошелька и выведите результат

    Запуск: npx nestjs-command t31:task3
    */
    @Command({
        command: 't31:task3',
        describe: 'Задача 31.3',
    })
    async T31_3() {
        const wallet = this.web3.eth.accounts.wallet.create();

        for (let i = 1; i <= 3; i++) {
            const entropy:any = readline.question(`Enter entropy for account ${i}: `);

            wallet.add(this.web3.eth.accounts.create(entropy));
        }

        const password:any = readline.question("Enter password: ");
        const encryptWallet = await wallet.encrypt(password);

        console.log(encryptWallet);
    }

    /**
    Задача 4

    Напишите скрипт, который принимает закрытый ключ(или сроку для энтропии), адрес adr и количество wei value, которые необходимо отправить на адрес 
    Создаёт новый аккаунт и от имени созданного аккаунта подписывает транзакцию, в которой содержится отправка value wei на адрес adr 
    Скрипт выводит raw транзакцию в консоль

    Запуск: npx nestjs-command t31:task4
    */
    @Command({
        command: 't31:task4',
        describe: 'Задача 31.4',
    })
    async T31_4() {
        const entropy = readline.question("Enter entropy: ");
        const address = readline.question("Enter address: ");
        const value = readline.question("Send value: ");
        const account = this.web3.eth.accounts.create(entropy);
        const transaction = await this.web3.eth.accounts.signTransaction({
            from: account.address,
            to: address,
            value,
            gas: 21000
        }, account.privateKey);

        console.log(transaction.rawTransaction);
    }

    /**
    Задача 5

    Напишите скрипт, который выводит значения слотов Storage, в котором хранятся значения элементов динамического массива data контракта 
    0x12f428dfb80BA48e4F373681D237E00660dEEea1

    для решения этого задания пригодится следующая теория:
    https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays
    https://web3js.readthedocs.io/en/v1.8.0/web3-utils.html#sha3
    https://web3js.readthedocs.io/en/v1.8.0/web3-utils.html#tobn
    https://web3js.readthedocs.io/en/v1.8.0/web3-utils.html#tohex

    Запуск: npx nestjs-command t31:task5
    */
    @Command({
        command: 't31:task5',
        describe: 'Задача 31.5',
    })
    async T31_5() {
        const contract = '0x12f428dfb80BA48e4F373681D237E00660dEEea1';
        const slot = this.web3.utils.keccak256('0x000000000000000000000000000000000000000000000000000000000000002');
        const size = this.web3.utils.hexToNumber(await this.web3.eth.getStorageAt(contract, 2));

        for (let i = 0; i < size; i++) {
            await this.web3.eth.getStorageAt(contract, this.web3.utils.toBN(slot).add(this.web3.utils.toBN(i))).then(console.log);
        }
    }
}