import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import Web3 from "web3";
import { Web3Service } from "../web3.service";

@Injectable()
export class T32 {
    web3: any;

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.alchemy();
    }
    

    /**
    Задача 1.

    Напишите программу, которая последовательно выводит в консоль приглашение ввести:

    адрес узла к которому необходимо подключится
    адрес аккаунта по умолчанию
    блок по умолчанию
    хардфорк по умолчанию
    цепочку по умолчанию

    подключается к узлуи инициализирует считанными из консоли значениями соответствующие параметры в настройках web3

    Запуск: npx nestjs-command t32:task1
    */
    @Command({
        command: 't32:task1',
        describe: 'Задача 32.1',
    })
    async T32_1() {
        const nodeAddress:any = readline.question("Enter node address: ");
        const defaultAccount:any = readline.question("Enter default address: ");
        const defaultBlock:any = readline.question("Enter default block: ");
        const defaultHardFork:any = readline.question("Enter default hard fork: ");
        const defaultChain:any = readline.question("Enter default chain: ");

        const web3 = new Web3(nodeAddress);

        web3.eth.defaultAccount = defaultAccount;
        web3.eth.defaultBlock = defaultBlock;
        web3.eth.defaultHardfork = defaultHardFork;
        web3.eth.defaultChain = defaultChain;

        console.log(web3);
    }

    /** 
    Задача 2.

    Напишите программу, которая выводит в консоль приглашение адрес узла

    Подключается к узлу и выводит:

    информацию об узле
    id цепочки
    версию протокола
    синхронизируется ли узел

    Запуск: npx nestjs-command t32:task2
    */
    @Command({
        command: 't32:task2',
        describe: 'Задача 32.2',
    })
    async T32_2() {
        const nodeAddress:any = readline.question("Enter node address: ");
        const web3 = new Web3(nodeAddress);

        console.log('NodeInfo: ', web3.eth.getNodeInfo);
        console.log('ChainId:', web3.eth.getChainId);
        console.log('ProtocolVersion: ', web3.eth.getProtocolVersion);
        console.log('isSyncing: ', web3.eth.isSyncing);
    }

    /**
    Задача 3

    Напишите программу, которая исходя из параметров последнего блока в цепочке определяет будет ли цена на газ в следующем блоке расти или падать

    И выводит сообщение “price increases” или “price decreases”

    Запуск: npx nestjs-command t32:task3
    */
    @Command({
        command: 't32:task3',
        describe: 'Задача 32.3',
    })
    async T32_3() {
        await this.web3.eth.getBlock('latest', (error, block) => {
            console.log(block.gasUsed);
            if (block.gasUsed > 15_000_000) {
                console.log('price increases');
            } else {
                console.log('price decreases');
            }
        });
    }


    /**
    Задача 4

    Напишите программу, которая при запуске выводит в консоль информацию о текущей цене на газ и прогноз о том, будет она расти или падать.

    Далее программа предлагает ввести целевую базовую цену газ

    В течение ближайших 10 блоков программу проверяет цену на газ и, если в очередном блоке цена на газ ниже указанной вами целевой цены и прогнозируется дальнейшее падение цены, программа выводит сообщение об успехе “success”
    Если в течение 10 блоков базовая цена за газ всё ещё остаётся выше указанной вами целевой цене, выводится сообщение “Gas is too expensive. try again later”

    В этой задаче желательно делать задержки между запросами новых блоков, так как новые блоки появляются раз в 12 секунд.

    Для этого можно использовать следующую фукнцию:

    function sleep(milliseconds) {      
        const date = Date.now();        
        let currentDate = null;      
        do {              
            currentDate = Date.now();      
        } while (currentDate - date < milliseconds);
    }  

    При вызове этой функции нужно передавать время в миллисекундах, в течение которого будет происходить задрежка
    Например, задержка в течение 10 секунд

    sleep(10000)

    Запуск: npx nestjs-command t32:task4
    */

    sleep(milliseconds) {      
        const date = Date.now();        
        let currentDate = null;      
        do {              
            currentDate = Date.now();      
        } while (currentDate - date < milliseconds);
    }

    @Command({
        command: 't32:task4',
        describe: 'Задача 32.4',
    })
    async T32_4() {
        await this.web3.eth.getBlock('latest', (error, block) => {
            console.log(`number: ${block.number} baseFeePerGas: ${block.baseFeePerGas}`);
            if (block.gasUsed > 15_000_000) {
                console.log('price increases');
            } else {
                console.log('price decreases');
            }
        });

        const targetBaseFee:any = readline.question("Enter target base fee: ");
        let startBlock = await this.web3.eth.getBlockNumber();
        let endBlock = startBlock + 3;

        while(startBlock <= endBlock) {
            this.sleep(10000);
            const newBlock = await this.web3.eth.getBlock('latest');
            if (newBlock.number > startBlock) {
                console.log(`number: ${newBlock.number} baseFeePerGas: ${newBlock.baseFeePerGas}`);
                if (newBlock.baseFeePerGas <= targetBaseFee) {
                    console.log('success');
                    return;
                }
                startBlock = newBlock.number;
            }
        }

        console.log('Gas is too expensive');
    }
}