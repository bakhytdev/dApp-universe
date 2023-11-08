import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { ConfigService } from "@nestjs/config";
import { EthersService } from "../ethers.service";
import * as readline from "readline-sync";
import { ethers } from "ethers";

@Injectable()
export class T52 {

    constructor(
        private readonly ethersService: EthersService  
    ) {}

    /**
    Задача 1

    Напишите скрипт, который выводит для пользователя в консоль предложение создать один возможных провайдеров:
    - Провайдер по умолчанию
    - RPC-провайдер
    - API-провайдер

    После выбора пользователя как провайдер он хочет создать, ему предлагается ввести параметры, необходимые для создания провайдера, который он выбрал
    Скрипт считывает все необходимые параметры, создаёт провайдер и выводит информацию о нём в консоль

    Запуск: npx nestjs-command t52:task1
    */
    @Command({
        command: 't52:task1',
        describe: 'Задача 52.1',
    })
    async T52_1() {        
        const prompts = [
            'Провайдер по умолчанию',
            'RPC провайдер',
            'API провайдер'
        ];

        let network;
        let provider;

        console.log(prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n"));

        const choose = readline.prompt();

        switch(choose) {
            case '1':
                console.log('Укажите сеть:');
                network = readline.prompt() || 'goerli';
                provider = ethers.getDefaultProvider(network);
                break;
            case '2':
                console.log('Укажите точку подключения:');
                network = readline.prompt() || this.ethersService.getGoerliHost();
                provider = new ethers.JsonRpcProvider(network);
                break;
            case '3':
                console.log('Укажите поставщика API:');
                const api = readline.prompt() || 'Alchemy';

                console.log('Укажите сеть:');
                network = readline.prompt() || 'goerli';
                
                console.log('Укажите API ключ:');
                const key = readline.prompt() || this.ethersService.getGoerliKey();

                if (api === 'Alchemy') {
                    provider = new ethers.AlchemyProvider(network, key);
                } else {
                    provider = ethers.getDefaultProvider(network);
                }
                break;
            default:
        }   
        
        console.log('BlockNumber: ', await provider.getBlockNumber());

        process.exit();
    }

    /**
    Задача 2

    Скрипт создаёт RPC-провайдера, подключённого к Ganache и выводит информацию о подключении, списку поддерживаемых узлом аккаунтов, сети, номер последнего блока и стоимость газа 
    После чего создаёт API-провайдера подключённого к Alchemi и выводит ту же информацию

    Запуск: npx nestjs-command t52:task2
    */
    @Command({
        command: 't52:task2',
        describe: 'Задача 52.2',
    })
    async T52_2() {   
        const prompts = [
            'Ganache',
            'Alchemy',
        ];

        console.log(prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n"));

        const choose = readline.prompt();

        let provider;

        switch(choose) {
            case '1':
                provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
                break;
            case '2':
                provider = new ethers.AlchemyProvider('goerli',  this.ethersService.getGoerliKey());
                break;
            default:
                provider = ethers.getDefaultProvider('goerli');
        }


        await provider.listAccounts().then(list => {
            console.log('listAccounts: ', list.map(item => item.address));
        });

        await provider.getNetwork().then(network => {
            console.log('getNetwork: ', JSON.stringify(network));
        });

        await provider.getBlockNumber().then(blockNumber => {
            console.log('getBlockNumber: ', blockNumber);
        });

        await provider.getFeeData().then(data => {
            console.log('getFeeData::gasPrice: ', data.gasPrice);
        });

        process.exit();
    }

    /**
    Задача 3

    Скрипт создаёт провайдера, подключённого к тестовой сети Goerli
    Считывает хеш транзакции и выводит информацию об этой транзакции
    
    Запуск: npx nestjs-command t52:task3
    */
    @Command({
        command: 't52:task3',
        describe: 'Задача 52.3',
    })
    async T52_3() {   
        const prompts = [
            'Infura::sepolia',
            'Alchemy::goerli',
        ];

        console.log(prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n"));

        const choose = readline.prompt();

        let provider;

        switch(choose) {
            case '1':
                provider = new ethers.InfuraProvider(
                    process.env.ETHEREUM_NETWORK,
                    process.env.INFURA_API_KEY
                );
                break;
            case '2':
                provider = new ethers.AlchemyProvider('goerli',  this.ethersService.getGoerliKey());
                break;
            default:
                provider = ethers.getDefaultProvider('goerli' || 'sepolia');

        }

        console.log('Введите хеш транзакции');

        const hash:string = readline.prompt();
        const transaction = await provider.getTransaction(hash);

        console.log(transaction);

        process.exit();
    }

    /**
    Задача 4

    Скрипт создаёт провайдера, подключённого к тестовой сети Goerli

    Далее скрипт считывает данные, необходимые для создания TransactionRequest, такие как:
    from
    to
    data (опционально если вызывается контракт)
    value
    Информацию для некоторых полей, например
    gasPrice
    maxFeePerGas
    скрипт может получить из сети, используя методы провайдера

    Далее скрипт рассчитывает сколько газа необходимо на выполнение этой транзакции и выводит результат в консоль
    
    Запуск: npx nestjs-command t52:task4
    */
    @Command({
        command: 't52:task4',
        describe: 'Задача 52.4',
    })
    async T52_4() {   
        const provider = new ethers.AlchemyProvider('goerli', this.ethersService.getGoerliKey());
        const transactionRequest = {
            from: '',
            to: '',
            value: '',
            data: '',
            maxFeePerGas: BigInt(0),
            maxPriorityFeePerGas: BigInt(0),
            chainId: BigInt(0),
            nonce: 0
        };

        console.log('Введите адрес отправителя');
        transactionRequest.from = readline.prompt();

        console.log('Введите адрес получателя');
        transactionRequest.to = readline.prompt();

        console.log('Введите количество эфира');
        transactionRequest.value = readline.prompt();

        console.log('Вызов контракта? 1 - да, 2 - нет');
        const choose = readline.prompt();

        switch(choose) {
            case '1':
                console.log('Введите данные для вызова контракта');
                transactionRequest.data = readline.prompt();
                break;
            default:
        }

        const feeData = await provider.getFeeData();

        transactionRequest.maxFeePerGas = feeData.maxFeePerGas;
        transactionRequest.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        transactionRequest.chainId = (await provider.getNetwork()).chainId;
        transactionRequest.nonce = (await provider.getTransactionCount(transactionRequest.from));

        console.log('transactionRequest: ', transactionRequest);

        await provider.estimateGas(transactionRequest).then(console.log);

        process.exit();
    }

    /**
    Задача 5

    Скрипт создаёт провайдера, подключённого к тестовой сети Goerli
    Считывает номер блока и выводит информацию о транзакции этого блока, в которой было переслано больше всего Эфира
    
    Запуск: npx nestjs-command t52:task5
    */
    @Command({
        command: 't52:task5',
        describe: 'Задача 52.5',
    })
    async T52_5() {   
        const provider = new ethers.AlchemyProvider('goerli', this.ethersService.getGoerliKey());

        console.log('Введите номер блока');
        const blockNumber = readline.prompt();

        const { prefetchedTransactions } = await provider.getBlock(BigInt(blockNumber), true);

        let maxValue = BigInt(0);
        let maxTx = null;

        for(let tx of prefetchedTransactions) {
            if (tx.value > maxValue) {
                maxValue = BigInt(tx.value);
                maxTx = tx;
            }
        }

        console.log('maxTx: ', maxTx);
        console.log('maxValue: ', maxValue);

        process.exit();
    }

    /**
    Задача 6

    Скрипт создаёт провайдера, подключённого к тестовой сети Goerli
    Считывает адрес аккаунта и выводит его баланс
    Если аккаунт является смарт контрактом, скрипт выводит его код и предлагает вывести информацию о данных контракта, хранящихся в storage
    Считывает необходимые для этого значения и выводит данныев консоль
    
    Запуск: npx nestjs-command t52:task6
    */
    @Command({
        command: 't52:task6',
        describe: 'Задача 52.6',
    })
    async T52_6() {
        const provider = new ethers.AlchemyProvider('goerli', this.ethersService.getGoerliKey());

        console.log('Введите адрес аккаунта');
        const address = readline.prompt();
        const balance = await provider.getBalance(address);
        const code = await provider.getCode(address);

        console.log('getBalance: ', balance);
        console.log('getCode: ', code);

        process.exit();
    }
}