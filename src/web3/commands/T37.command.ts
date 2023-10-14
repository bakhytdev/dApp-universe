import { Injectable, StreamableFile } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { Web3Service } from "../web3.service";

@Injectable()
export class T37 {
    web3: any;
    contract: string;

    defaultKeys = [
        "0x936b72cbe3c6ed92d71b34072788198cd0883f152f4ddae8a7108d735c577de4",
        "0xf15319eff32b63de23cc13f395836c0aa16410187f454a4bdb913a4573657b82"
    ];

    constructor(
        private readonly web3Service: Web3Service  
    ) {
        this.web3 = this.web3Service.ganacheWS();
    }

    /**
    Запуск: npx nestjs-command t37_3:compile
    */
    @Command({
        command: 't37_3:compile',
        describe: 'Скомпилировать контракт T37_3.sol',
    })
    async T35_3_compile() {
        this.web3Service.compile('T37_3.sol', ['T37_3']);
    }

    /**
    Задача 1

    Напишите скрипт, который считывает закрытый ключ и создаёт из этого закрытого ключа аккаунт account
    После чего подписывается на новые транзакции в сети, но выводит в терминал только транзакции, исходящие или входящие на адрес account
    Совершите в скрипте одну транзакцию исходящую с account и одну транзакцию  входящую на account

    Запуск: npx nestjs-command t37:task1
    */
    @Command({
        command: 't37:task1',
        describe: 'Задача 37.1',
    })
    async T37_1() {
        const privateKeySender:string = readline.question("Enter private key Sender: ") || this.defaultKeys[0];
        const accountSender = this.web3.eth.accounts.privateKeyToAccount(privateKeySender);

        const privateKeyReceiver:string = readline.question("Enter private key Receiver: ") || this.defaultKeys[1];
        const accountReceiver = this.web3.eth.accounts.privateKeyToAccount(privateKeyReceiver);

        this.web3.eth.subscribe('pendingTransactions')
                        .on("error", console.log)
                        .on("data", async (txHash) => {
                            const transaction = await this.web3.eth.getTransaction(txHash);

                            if ([transaction.from, transaction.to].includes(accountSender.address)) {
                                console.log("Sender transaction: ", transaction);
                            }
                        });

        const txSender = await this.web3.eth.accounts.signTransaction({
            from: accountSender.address,
            to: accountReceiver.address,
            value: 1_000_000_000_000_000_000,
            gas: 21_000
        }, privateKeySender);

        await this.web3.eth.sendSignedTransaction(txSender.rawTransaction)
                                .on('receipt', (receipt) => {
                                    console.log('txSender: ', receipt)
                                });

        const txReceiver = await this.web3.eth.accounts.signTransaction({
            from: accountReceiver.address,
            to: accountSender.address,
            value: 1_000_000_000_000_000_000,
            gas: 21_000
        }, privateKeyReceiver);

        await this.web3.eth.sendSignedTransaction(txReceiver.rawTransaction)
                                .on('receipt', (receipt) => {
                                    console.log('txReceiver: ', receipt)
                                });
    }

    /**
    Задача 2

    Напишите скрипт, который отслеживает появление новых блоков в сети и выводит в терминал следующую информацию о новых блоках:
     - номер блока
     - количество транзакций в блоке
     - общую сумму eth, пересылаемого во всех транзакциях блока

    Запуск: npx nestjs-command t37:task2
    */
    @Command({
        command: 't37:task2',
        describe: 'Задача 37.2',
    })
    async T37_2() {
        const wss = this.web3Service.alchemyWSS();
        
        wss.eth.subscribe('newBlockHeaders')
                        .on("error", console.log)
                        .on("data", async (blockHeader) => {                            
                            const number = blockHeader.number;
                            const block = await wss.eth.getBlock(number, true);
                            let sum = 0
                            
                            block?.transactions.map(tx => {
                                sum += Number(tx.value);
                            });         
                            
                            console.log('Block number: ', number);
                            console.log('Count transactions: ', block.transactions.length);
                            console.log('Sum transactions: ', sum);
                        })
    }

    /**
    Задача 3

    Напишите контракт, который содержит два ивента:
    Receive(address indexed sender, uint256 indexed value);
    SetData(uint256 indexed number, string str, uint256 data);

    А также функции
    receive(){}
    SetData(uint256 number, string str, uint256 data){}
    В которых вызываются указанные выше ивенты

    Напишите скрипт, который развернёт этот скрипт в тестовой сети
    А затем подпишется на оба события
    Создайте пару транзакций с вызовом указанных функций, убедитесь, что в терминал выводится информация о срабатывании событий

    Запуск: npx nestjs-command t37:task3
    */
    @Command({
        command: 't37:task3',
        describe: 'Задача 37.3',
    })
    async T37_3() {
        const contractName = 'T37_3';

        const privateKeyDeployer:string = readline.question("Enter private key Sender: ") || this.defaultKeys[0];
        const accountDeployer = this.web3.eth.accounts.privateKeyToAccount(privateKeyDeployer);

        this.web3.eth.defaultAccount = accountDeployer.address;

        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 
        
        const contract = new this.web3.eth.Contract(ABI);
        const instance = await contract
                                .deploy({ data: bytecode })
                                .send({ from: accountDeployer.address, gas: 1_000_000 });

        const eventReceive = this.web3.utils.sha3("Receive(address,uint256)");

        instance.events.Receive({ topics: [eventReceive] }).on("data", (log) => console.log(log.event, log));

        const privateKeySender:string = readline.question("Enter private key Receiver: ") || this.defaultKeys[1];
        const accountSender = this.web3.eth.accounts.privateKeyToAccount(privateKeySender);  

        const tx = await this.web3.eth.accounts.signTransaction({
            from: accountSender.address,
            to: instance.options.address,
            value: 1_000_000_000,
            gas: 50_000
        }, privateKeySender);

        await this.web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', (receipt) => console.log('txReceiver: ', receipt));

        const eventSetData = this.web3.utils.sha3("SetData(uint256,string,uint256[])");

        instance.events.SetData({ topics: [eventSetData] }).on("data", (log) => console.log(log.event, log));
        instance.methods.setData(100, 'Text', []).send({ from: accountSender.address }).on('receipt', console.log).then(console.log);
    }

    /**
    Задача 4

    Модифицируйте предыдущий скрипт
    Настройте фильтр для событий таким образом, чтобы отслеживались события только для определённых значений sender и number

    Запуск: npx nestjs-command t37:task4
    */
    @Command({
        command: 't37:task4',
        describe: 'Задача 37.4',
    })
    async T37_4() {
        const contractName = 'T37_3';

        const privateKeyDeployer:string = readline.question("Enter private key Sender: ") || this.defaultKeys[0];
        const accountDeployer = this.web3.eth.accounts.privateKeyToAccount(privateKeyDeployer);

        this.web3.eth.defaultAccount = accountDeployer.address;

        const ABI = this.web3Service.getABI(contractName); 
        const bytecode = this.web3Service.getBytecode(contractName); 
        
        const contract = new this.web3.eth.Contract(ABI);
        const instance = await contract
                                .deploy({ data: bytecode })
                                .send({ from: accountDeployer.address, gas: 1_000_000 });

        const eventReceive = this.web3.utils.sha3("Receive(address,uint256)");

        const filterValue:string = readline.question("Enter filter value: ");

        instance.events.Receive({
            filter: { value: filterValue },
            topics: [eventReceive] 
        }).on("data", (log) => console.log(log.event, log));

        const privateKeySender:string = readline.question("Enter private key Receiver: ") || this.defaultKeys[1];
        const accountSender = this.web3.eth.accounts.privateKeyToAccount(privateKeySender);  

        const tx = await this.web3.eth.accounts.signTransaction({
            from: accountSender.address,
            to: instance.options.address,
            value: 1_000_000_000,
            gas: 50_000
        }, privateKeySender);

        await this.web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', (receipt) => console.log('txReceiver: ', receipt));

        const eventSetData = this.web3.utils.sha3("SetData(uint256,string,uint256[])");

        const filterNumber:string = readline.question("Enter filter number: ");

        instance.events.SetData({ 
            filter: { number: filterNumber },
            topics: [eventSetData] 
        }).on("data", (log) => console.log(log.event, log));

        instance.methods.setData(100, 'Text', []).send({ from: accountSender.address }).on('receipt', console.log).then(console.log);
    }
}