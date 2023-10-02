import { Injectable } from "@nestjs/common";
import { Command, Positional } from "nestjs-command";
import Web3 from "web3";
import { isAddress } from 'web3-validator';
import * as readline from "readline-sync";
import * as BN from 'bn.js';
import { number } from "yargs";

const web3 = new Web3(new Web3.providers.HttpProvider('https://eth-goerli.g.alchemy.com/v2/LghGiUNiAVBdYk2dN-ykVv4miDqD7zln'));

@Injectable()
export class T29 {

    /**
    Задача 1

    1. Зарегистрируйтесь на Alchemy и создайте там новый проект
    2. Создайте новый web3 проект помощью Node js 
    3. Напиште код, который подключается к блокчейну Ethereum, и выводит одно значение - номер последнего блока в блокчейне

    Запуск: npx nestjs-command t29:task1
    */
    @Command({
        command: 't29:task1',
        describe: 'Задача 29.1',
    })
    async T29_1() {
        console.log('getBlockNumber: ', await web3.eth.getBlockNumber());
    }

    /**
    Задача 2

    Напишите программу, которая будет на вход получать одно значение - некоторый адрес аккаунта
    Затем при помощи метода web3.utils.isAddress() будет определять правильный это адрес или нет
    И выводить true или false

    Запуск: npx nestjs-command t29:task2
    */
    @Command({
        command: 't29:task2',
        describe: 'Задача 29.2',
    })
    async T29_2() {
        const address = readline.question("Enter address: ");

        console.log('isAddress: ', isAddress(address));
    }

    /**
    Задача 3

    Напишите программу, которая
        • получает на вход одно значение - адрес аккаунта
        • выводит одно значение - баланс на этом адресе

    Запуск: npx nestjs-command t29:task3
    */
    @Command({
        command: 't29:task3',
        describe: 'Задача 29.3',
    })
    async T29_3() {
        const address = readline.question("Enter address: ");

        console.log('getBalance: ', await web3.eth.getBalance(address));
    }

    /**
    Задача 4

    Напишите программу, которая
        • получает на вход одно значение - адрес транзакции
        • и выводит атрибуты этой транзакции

    Запуск: npx nestjs-command t29:task4
    */
    @Command({
        command: 't29:task4',
        describe: 'Задача 29.4',
    })
    async T29_4() {
        const txHash = readline.question("Enter txHash: ");

        console.log('txHash Attributes: ', await web3.eth.getTransaction(txHash));
    }

    /**
    Задача 5

    Теперь научимся получать всю информацию о транзакциях в блокчейне!
    Напишите программу, которая принимает на вход одно значение - хеш транзакции, а выводит следующую информацию:
        • кто отправитель
        • кто получатель
        • сколько переведено эфира
    
    Запуск: npx nestjs-command t29:task5
    */
    @Command({
        command: 't29:task5',
        describe: 'Задача 29.5',
    })
    async T29_5() {
        const txHash = readline.question("Enter txHash: ");
        const result = await web3.eth.getTransaction(txHash);

        console.log(`From: ${result.from}`);
        console.log(`To: ${result.to}`);
        console.log(`Value: ${result.value}`);
    }

    /**
    Задача 6

    Напишите программу, которая
        • получает на вход одно значение - номер блока
        • выводит информацию о всех транзакциях этого блока. То есть, из номера блока программа достаёт список хешей транзакций и выводит информацию о каждой из этих транзакций

    Запуск: npx nestjs-command t29:task6
    */
    @Command({
        command: 't29:task6',
        describe: 'Задача 29.6',
    })
    async T29_6() {
        const blockNumber = readline.question("Enter block number: ");
        const result = await web3.eth.getBlock(blockNumber, true);

        console.log('Block number transactions', result.transactions);
    }

    /**
    Задача 7 

    Отлично! Продолжим анализ сети
    Напишите программу, которая поможет найти в блоке транзакцию, в которой отправлено самое большое количество эфира
    Эта программа должна принимать на вход номер блока, а возвращать
        • Хэш искомой транзакции
        • Количество эфира, пересылаемого в этой транзакции

    Запуск: npx nestjs-command t29:task7
    */
    @Command({
        command: 't29:task7',
        describe: 'Задача 29.7',
    })
    async T29_7() {
        const blockNumber = readline.question("Enter block number: ");
        const { transactions } = await web3.eth.getBlock(blockNumber, true);        

        let maxValue = new BN(0);
        let maxTransaction;

        transactions.map((transaction) => {
            let value = new BN(transaction.value);

            if (value.gt(maxValue)) {
                maxValue = value;
                maxTransaction = transaction;
            }
        });

        console.log('maxTransaction: ', maxTransaction.hash);
        console.log('maxValue: ', maxValue.toString());
    }

    /**
    Задача 8
    
    А теперь давайте немного усложним предыдущую задачу
    Вам необходимо не только найти транзакцию с самым большим значением пересылаемого эфира, но и подробно выяснить, кто это такой богатый завёлся в нашей уютной тестовой сети.
    Теперь ваша программа должна выводить следующую информацию:
        • Хэш транзакции
        • Сумму транзакции
        • Адрес кошелька отправителя
        • Баланс на кошельке отправителя
        • Адрес кошелька получателя
        • Баланс на кошельке получателя

    Запуск: npx nestjs-command t29:task8
    */
    @Command({
        command: 't29:task8',
        describe: 'Задача 29.8',
    })
    async T29_8() {
        const blockNumber = readline.question("Enter block number: ");
        const { transactions } = await web3.eth.getBlock(blockNumber, true);        

        let maxValue = new BN(0);
        let maxTransaction;

        transactions.map((transaction) => {
            let value = new BN(transaction.value);

            if (value.gt(maxValue)) {
                maxValue = value;
                maxTransaction = transaction;
            }
        });

        const fromBalance = await web3.eth.getBalance(maxTransaction.from);
        const toBalance = await web3.eth.getBalance(maxTransaction.to);

        console.log('maxValue: ', maxValue.toString());
        console.log('maxTransaction: ', maxTransaction.hash);

        console.log('from: ', maxTransaction.from);
        console.log('fromBalance: ', fromBalance);

        console.log('to: ', maxTransaction.to);
        console.log('toBalance: ', toBalance);
    }

    /**
    Задача 9

    К сожалению, в web3.js нет функции, которая могла бы вывести все транзакции, совершённые с определённого аккаунта
    Придётся реализовать это самостоятельно
    Напишите программу, которая
        • получает на вход три значения:
            ◦ адрес аккаунта
            ◦ номер блока - первого блока из диапазона
            ◦ номер блока - последнего блока из диапазона
        • а выводит список хешей всех транзакций, которые были совершены с указанного адреса в указанном диапазоне 

    Запуск: npx nestjs-command t29:task9
    */
    @Command({
        command: 't29:task9',
        describe: 'Задача 29.9',
    })
    async T29_9() {
        const accountAddress = readline.question("Enter account address: ");
        const startBlock:any = readline.question("Enter start block: ");
        const endBlock:any = readline.question("Enter end block: ");

        const accountTransactions = [];

        for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
            console.log(`check block number ${blockNumber}`);
            const { transactions } = await web3.eth.getBlock(blockNumber, true);   
            
            if (transactions) {
                transactions.map((transaction) => {
                    if (transaction.from == accountAddress) {
                        console.log(`transaction found ${transaction.hash}`);
                        accountTransactions.push(transaction.hash);
                    }
                });  
            }
        }

        console.log(`${accountAddress} transactions: `);
        console.log(accountTransactions);
    }
}