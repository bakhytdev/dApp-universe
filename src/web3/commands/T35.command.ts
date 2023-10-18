import { Injectable, StreamableFile } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import Web3 from "web3";
import { Web3Service } from "../web3.service";

@Injectable()
export class T35 {
    web3: any;
    contract: string;

    defaultKey = "0x2b71fa26b9b1f9e9ee3eb8a60b19886ce3c737111ab0d2a1561c2dbe5a819d37";
    defaultAdr = "0x249C04B34E873b3E5B82CdbEF22aB735e1b7e2b9";

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.ganache();
    }

    /**
    Запуск: npx nestjs-command t35_1:compile
    */
    @Command({
        command: 't35_1:compile',
        describe: 'Скомпилировать контракт T35_1.sol',
    })
    async T35_1_compile() {
        this.web3Service.compile('T35_1.sol', ['T35_1']);
    }

    /**
    Запуск: npx nestjs-command t35_2:compile   
    */
    @Command({
        command: 't35_2:compile',
        describe: 'Скомпилировать контракт T35_2.sol',
    })
    async T35_2_compile() {
        this.web3Service.compile('T35_2.sol', ['T35_2_Main', 'T35_2_Caller']);
    }

    /**
    Запуск: npx nestjs-command t35_3:compile
    */
        @Command({
        command: 't35_3:compile',
        describe: 'Скомпилировать контракт T35_3.sol',
    })
    async T35_3_compile() {
        this.web3Service.compile('T35_3.sol', ['T35_3_Wallet', 'T35_3_Bank', 'T35_3_Credit']);
    }

    /**
     * Функция выбора метода для задачи 35.1 и 35.2

     * @param contract 
     * @param account 
     */
    async choose(contract, account) {
        const choose:string = readline.question(`Choose method: 
            1. x()
            2. y()
            3. str()
            4. map(address)
            5. setXY(uint256, uint256)
            6. setStr(string)
            7. init(uint256)
            8. addToMap(address, St)
            9. EXIT
        `);

        switch(choose) {
            case "1":
                await contract.methods.x().call().then(console.log);
                break;
            case "2":
                await contract.methods.y().call().then(console.log);
                break;
            case "3":
                await contract.methods.str().call().then(console.log);
                break;
            case "4":
                const _adr = readline.question("Enter address: ");
                await contract.methods.map(_adr).call().then(console.log);
                break;
            case "5":
                const _x:string = readline.question("Enter x: ");
                const _y:string = readline.question("Enter y: ");
                await contract.methods.setXY(_x, _y)
                        .send({ from: account.address })
                        .on('receipt', console.log)
                        .then(console.log);
                break;
            case "6":
                const _str:string = readline.question("Enter str: ");
                await contract.methods.setStr(_str)
                        .send({ from: account.address })
                        .on('receipt', console.log)
                        .then(console.log);
                break;
            case "7":
                const _count:string = readline.question("Enter count: ");
                await contract.methods.init(_count)
                        .send({ from: account.address })
                        .on('receipt', console.log)
                        .then(console.log);
                break;
            case "8":
                const _address = readline.question("Enter address: ");
                const _number = readline.question("Enter number: ");
                const _string = readline.question("Enter str: ");
                await contract.methods.addToMap(_address, [_number, _string])
                        .send({ from: account.address })
                        .on('receipt', console.log)
                        .then(console.log);
                break;
            default:
                console.log("Exit!!!");
        }

        await this.choose(contract, account);
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
        
        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 

        const privateKey:string = readline.question("Enter private key: ") || this.defaultKey;
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        
        let contract = new this.web3.eth.Contract(ABI);
        
        const x:number = readline.question("Enter x: ") || 1;
        const y:number = readline.question("Enter y: ") || 2;
        const str:string = readline.question("Enter str: ") || "TEST";

        const instance = await contract
                            .deploy({
                                data: bytecode,
                                arguments: [x, y, str]
                            })
                            .send({ from: account.address, gas: 1_000_000 });

        //await this.choose(instance, account);

        //console.log(instance.methods);
    
        const keys = Object.keys(instance.methods);
        const exit = 'Exit()';
        const methods = [
            { 
                fn: exit, 
                payable: false,
                inputs: [],
                constant: false
            }
        ];

        keys.map((key) => {
            if (key.includes('0x')) {
                const pre = keys.indexOf(key) - 1;
                methods.push({ ...{ fn: keys[pre] }, ...instance._jsonInterface.find(item => item.signature === key) });
            }
        });

        console.log('All methods: ', methods);

        while(true) {
            const selected = readline.question(`\nChoose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                const args = [];

                method.inputs.map((input) => {
                    switch(input.type) {
                        case 'address':
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `) || this.defaultAdr);
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
    
                if (method.fn === exit) process.exit();

                //console.log(...args);
    
                if (method.constant) {
                    console.log(`${method.fn}.send()`);
                    await instance.methods[method.fn](...args)
                            .call({ 
                                from: account.address,
                                gas: 1_000_000,
                            })
                            .then((result) => console.log('result: ', result));
                } else {
                    console.log(`${method.fn}.call()`);
                    await instance.methods[method.fn](...args)
                            .send({ 
                                from: account.address, 
                                gas: 1_000_000 
                            })
                            .on('receipt', (receipt) => console.log('receipt:', receipt))
                            .then((result) => console.log('result: ', result));
                }
            }
        }
    }

    /**
    Задача 2

    Напишите скрипт, который развёртывает в сети оба контракта из файла task_35_2.sol 
    Далее скрипт выводит список методов, которые можно вызывать на контракте caller и предлагает выбрать один из методов для вызова, либо выбрать пункт “завершить работу”, в случае выбора которого скрипт завершает работу

    Далее для методов, которые принимают аргументы, скрипт предлагает ввести значения этих аргументов

    Далее происходит вызов нужного метода
    Реализуйте при помощи методов контракта caller вызов всех методов контракта example включая get-методы для публичных переменных

    После этого снова выводится меню выбора метода (выхода из программы)

    Очень важно правильно реализовать вызов и работу со всеми методами контракта!

    Запуск: npx nestjs-command t35:task2
    */
    @Command({
        command: 't35:task2',
        describe: 'Задача 35.2',
    })
    async T35_2() {
        const privateKey:string = readline.question("Enter private key: ") || this.defaultKey;
        const mainContract = await (async (privateKey) => {
            const contractName = 'T35_1';
        
            const ABI = this.web3Service.getABI(contractName); 
            const bytecode = this.web3Service.getBytecode(contractName); 
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            
            let contract = new this.web3.eth.Contract(ABI);
            
            const x:string = readline.question("Enter x: ") || 1;
            const y:string = readline.question("Enter y: ") || 2;
            const str:string = readline.question("Enter str: ") || "TEST";
    
            const result = await contract.deploy({
                data: bytecode,
                arguments: [x, y, str]
            })
            .send({ from: account.address, gas: 1_000_000 });

            return result;
        })(privateKey);

        const contractName = 'T35_2_Caller';
        
        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        
        const contractCaller = new this.web3.eth.Contract(ABI);
        const instance = await contractCaller.deploy({
                                                data: bytecode,
                                                arguments: [mainContract.options.address]
                                            })
                                            .send({ from: account.address, gas: 2_000_000});

        //await this.choose(instance, account);

        const keys = Object.keys(instance.methods);
        const exit = 'Exit()';
        const methods = [
            { 
                fn: exit, 
                payable: false,
                inputs: [],
                constant: false
            }
        ];

        keys.map((key) => {
            if (key.includes('0x')) {
                const pre = keys.indexOf(key) - 1;
                methods.push({ ...{ fn: keys[pre] }, ...instance._jsonInterface.find(item => item.signature === key) });
            }
        });

        console.log('All methods: ', methods);

        while(true) {
            const selected = readline.question(`\nChoose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                const args = [];

                method.inputs.map((input) => {
                    switch(input.type) {
                        case 'address':
                            args.push(readline.question(`Enter ${input.name}:${input.type}: `) || this.defaultAdr);
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
    
                if (method.fn === exit) process.exit();

                console.log(...args);
    
                if (method.constant) {
                    console.log(`${method.fn}.call()`);
                    await instance.methods[method.fn](...args)
                            .call({ 
                                from: account.address, 
                                gas: 5_000_000 
                            })
                            .then((result) => console.log('result: ', result));
                } else {
                    console.log(`${method.fn}.send()`);
                    await instance.methods[method.fn](...args)
                            .send({ 
                                from: account.address,
                                gas: 1_000_000,
                            })
                            .on('receipt', (receipt) => console.log('receipt:', receipt))
                            .then((result) => console.log('result: ', result));
                }
            }
        }
    }

    /**
    В уроке 17 (наследование) вы реализовывали контракт credit 

    Напишите скрипт для работы с этим контрактом

    Запуск: npx nestjs-command t35:task3
    */
    @Command({
        command: 't35:task3',
        describe: 'Задача 35.3',
    })
    async T35_3() {
        const contractName = 'T35_3_Credit';

        const privateKey:string = readline.question("Enter private key: ") || this.defaultKey;
        
        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        
        const contract = new this.web3.eth.Contract(ABI);
        const instance = await contract
                                    .deploy({
                                        data: bytecode,
                                        arguments: [10]
                                    })
                                    .send({ from: account.address, gas: 5_000_000 });

        //console.log(instance);
                                    
        const keys = Object.keys(instance.methods);
        const exit = 'Exit()';
        const methods = [
            { 
                fn: exit, 
                payable: false,
                inputs: [],
                constant: false
            }
        ];

        keys.map((key) => {
            if (key.includes('0x')) {
                const next = keys.indexOf(key) - 1;
                methods.push({ ...{ fn: keys[next] }, ...instance._jsonInterface.find(item => item.signature === key) });
            }
        });

        console.log('All methods: ', methods);

        while(true) {
            const selected = readline.question(`Choose method: \n${methods.map((item, index) => `${index}. ${item.fn}`).join("\n")} \n`);

            if (selected) {
                const method = methods[selected];

                const args = [];

                method.inputs.map((input) => {
                    args.push(readline.question(`Enter ${input.name}:${input.type}: `));
                });
    
                if (method.fn === exit) process.exit();

                console.log(...args);
    
                if (method.payable) {
                    console.log(`${method.fn}.send()`);
                    const value = readline.question(`Enter value: `);
                    try {
                        await instance.methods[method.fn](...args)
                        .send({ 
                            from: account.address,
                            gas: 1_000_000,
                            value
                        })
                        .on('receipt', (receipt) => console.log('receipt: ', receipt))
                        .then((result) => console.log('result: ', result));
                    } catch (err) {
                        console.log(err.data);
                    }
                } else {
                    console.log(`${method.fn}.call()`);
                    try {
                        await instance.methods[method.fn](...args).call({
                            from: account.address,
                            gas: 1_000_000
                        })
                        .then((result) => console.log('result: ', result));
                    } catch (err) {
                        console.log(err.data);
                    }
                }
            }
        }
    }
}