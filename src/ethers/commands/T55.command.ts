import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { FunctionFragment, ethers } from "ethers";
import { EthersService } from "../ethers.service";
import * as readline from "readline-sync";

@Injectable()
export class T55 {

    constructor(
        private readonly ethersService: EthersService
    ) {}

    /**
    Запуск: npx nestjs-command t55_1:compile
    */
    @Command({
        command: 't55_1:compile',
        describe: 'Скомпилировать контракт T55_1.sol',
    })
    async T35_1_compile() {
        this.ethersService.compile('T55_1.sol', ['T55_1']);

        process.exit();
    }

    /**
    Запуск: npx nestjs-command t55_3:compile
    */
    @Command({
        command: 't55_3:compile',
        describe: 'Скомпилировать контракт T55_3.sol',
    })
    async T35_3_compile() {
        this.ethersService.compile('T55_3.sol', ['T55_3_Wallet', 'T55_3_Bank', 'T55_3_Credit']);

        process.exit();
    }

    /**
    Задача 1
    Напишите скрипт, который развёртывает в локальной тестовой Ganache контракт из файла task_55.sol 
    Далее скрипт выводит список методов, которые можно вызывать на контракте, включая get-методы для публичных переменных, и предлагает выбрать один из методов для вызова, либо выбрать пункт “завершить работу”, в случае выбора которого скрипт завершает работу
    Далее для методов, которые принимают аргументы, скрипт предлагает ввести значения этих аргументов
    Далее происходит вызов нужного метода
    Если метод возвращает значения (платные методы в том числе), то они должно быть выведены в консоль
    После этого снова выводится меню выбора метода (выхода из программы)

    Запуск: npx nestjs-command t55:task1
    */
    @Command({
        command: 't55:task1',
        describe: 'Задача 55.1',
    })
    async 55_1() {
        const contractName = 'T55_1';
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
        const accounts = await provider.listAccounts();
        const signer = await provider.getSigner(accounts[0].address);

        const ABI = this.ethersService.getABI(contractName); 
        const bytecode = this.ethersService.getBytecode(contractName);

        const contractFactory = new ethers.ContractFactory(ABI, bytecode, signer);
        const contractDeployment = await (await contractFactory.deploy(100, 200, 'Text')).waitForDeployment();
        const contractInstance = new ethers.Contract(await contractDeployment.getAddress(), ABI, provider).connect(signer);
        const contractMethods = contractInstance.interface.fragments.filter((item) => item instanceof FunctionFragment);

        const exit = 'Exit()';
        const methods = [{ fn: exit }];

        contractMethods.map(item => methods.push({ ...{ fn: item.format() }, ...item }));
        
        while(true) {
            const selected = readline.question(`\nChoose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                if (method.fn === exit) process.exit();

                const args = [];

                method['inputs'].map((input) => {
                    switch(input.type) {
                        case 'address':
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `) || accounts[1].address);
                            break;
                        case 'tuple':
                            const tuple = '["123", "TEST"]'
                            console.log('Example tuple: ', tuple);
                            args.push(JSON.parse(readline.question(`Enter ${input.name}:${input.type}: `) || tuple));
                            break;
                        default:
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `));
                    }
                });

                const result = await contractInstance[method.fn](...args);

                console.log(result);
            }
        }
    }

    /**
    Задача 2
    Измените скрипт из предыдущего задания так, чтобы он работал с тестовой сетью Goerli

    Запуск: npx nestjs-command t55:task2
    */
    @Command({
        command: 't55:task2',
        describe: 'Задача 55.2',
    })
    async 55_2() {
        const contractName = 'T55_1';
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGoerliHost());
        const privateKey = readline.question(`Enter privateKey: `);
        const wallet = new ethers.Wallet(privateKey, provider);
        const ABI = this.ethersService.getABI(contractName); 
        const bytecode = this.ethersService.getBytecode(contractName);

        const contractFactory = new ethers.ContractFactory(ABI, bytecode, wallet);
        const contractDeployment = await (await contractFactory.deploy(100, 200, 'Text')).waitForDeployment();
        const contractMethods = contractDeployment.interface.fragments.filter((item) => item instanceof FunctionFragment);

        console.log('Deployed contract address - ', contractDeployment);

        const exit = 'Exit()';
        const methods = [{ fn: exit }];

        contractMethods.map(item => methods.push({ ...{ fn: item.format() }, ...item }));
        
        while(true) {
            const selected = readline.question(`\nChoose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                if (method.fn === exit) process.exit();

                const args = [];

                method['inputs'].map((input) => {
                    switch(input.type) {
                        case 'address':
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `));
                            break;
                        case 'tuple':
                            const tuple = '["123", "TEST"]'
                            console.log('Example tuple: ', tuple);
                            args.push(JSON.parse(readline.question(`Enter ${input.name}:${input.type}: `) || tuple));
                            break;
                        default:
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `));
                    }
                });

                const result = await contractDeployment[method.fn](...args);

                console.log(result);
            }
        }
    }

    /**
    Задача 3
    В уроке 17 (наследование) вы реализовывали контракт credit 
    Напишите скрипт для работы с этим контрактом

    Запуск: npx nestjs-command t55:task3
    */
    @Command({
        command: 't55:task3',
        describe: 'Задача 55.3',
    })
    async 55_3() {
        const contractName = 'T55_3_Credit';
        const provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
        const accounts = await provider.listAccounts();
        const signer = await provider.getSigner(accounts[0].address);

        const ABI = this.ethersService.getABI(contractName); 
        const bytecode = this.ethersService.getBytecode(contractName);

        const contractFactory = new ethers.ContractFactory(ABI, bytecode, signer);
        const contractDeployment = await (await contractFactory.deploy(10)).waitForDeployment();
        const contractInstance = new ethers.Contract(await contractDeployment.getAddress(), ABI, provider).connect(signer);
        const contractMethods = contractInstance.interface.fragments.filter((item) => item instanceof FunctionFragment);

        const exit = 'Exit()';
        const methods = [{ fn: exit }];

        contractMethods.map(item => methods.push({ ...{ fn: item.format() }, ...item }));
        
        while(true) {
            const selected = readline.question(`\nChoose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                if (method.fn === exit) process.exit();

                const args = [];

                method['inputs'].map((input) => {
                    switch(input.type) {
                        case 'address':
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `) || accounts[1].address);
                            break;
                        case 'tuple':
                            const tuple = '["123", "TEST"]'
                            console.log('Example tuple: ', tuple);
                            args.push(JSON.parse(readline.question(`Enter ${input.name}:${input.type}: `) || tuple));
                            break;
                        default:
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `));
                    }
                });

                const result = await contractInstance[method.fn](...args);

                console.log(result);
            }
        }
    }
}