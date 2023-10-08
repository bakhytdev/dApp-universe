import { Injectable, StreamableFile } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { Web3Service } from "../web3.service";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class T35 {
    web3: any;

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.ganache();
    }

    /**
    
    Задача 1

    Напишите скрипт, который развёртывает в сети контракт из файла task_35_1.sol 

    Далее скрипт выводит список методов, которые можно вызывать на контракте, включая get-методы для публичных переменных, 
    и предлагает выбрать один из методов для вызова, либо выбрать пункт “завершить работу”, в случае выбора которого скрипт завершает работу
    Далее для методов, которые принимают аргументы, скрипт предлагает ввести значения этих аргументов

    Далее происходит вызов нужного метода
    Если метод возвращает значения (платные методы в том числе), то они должно быть выведены в консоль

    После этого снова выводится меню выбора метода (выхода из программы)
    Очень важно правильно реализовать вызов и работу со всеми методами контракта!

    Запуск: npx nestjs-command t35:task1
    */
    @Command({
        command: 't35:task1',
        describe: 'Задача 35.1',
    })
    async T35_1() {
        const contractName = 'T35_1';

        this.web3Service.compile(contractName);
        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 

        const privateKey:string = readline.question("Enter private key: ") || "0x19454a2f4a0b0540ff9c933eddb80bff4c40f83657668eacd17ab43267a332f4";
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        const contract = new this.web3.Contract(ABI);
        console.log(contract);
        

        


        //

        // const enter:any = readline.question("Enter: ");

        // const entropy = '12345678901234567890123456789012'
        // const account1 = await this.web3.eth.accounts.create(entropy);

        // const key = '0x25738b830bf230266d4a1810e06d3218bddb8fd1ceed7d7a109aa62a6cd945ff';
        // const account2 = await this.web3.eth.accounts.privateKeyToAccount(key);
    }

    /**

    */
    @Command({
        command: 't35:task2',
        describe: 'Задача 35.2',
    })
    async T35_2() {

    }

    /**

    */
    @Command({
        command: 't35:task3',
        describe: 'Задача 35.3',
    })
    async T35_3() {

    }
}