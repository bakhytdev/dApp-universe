import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { FunctionFragment, ethers } from "ethers";
import { EthersService } from "../ethers.service";
import * as readline from "readline-sync";

@Injectable()
export class T57 {
    provider;

    defaultKeys = [
        "0xc624929612247eabc3fd8fe846ed82a1deadb29a1d1b66d466a053aad528ff1d",
    ];

    values = [
        ethers.toBigInt('1000000000000000000'),
        ethers.toBigInt('2000000000000000000')
    ];

    constructor(
        private readonly ethersService: EthersService
    ) {
        this.provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
    }

    /**
    Запуск: npx nestjs-command t57_3:compile
    */
    @Command({
        command: 't57_3:compile',
        describe: 'Скомпилировать контракт T57_3.sol',
    })
    async T35_1_compile() {
        this.ethersService.compile('T57_3.sol', ['T57_3']);
    }

    /**
    Задача 1
    Напишите скрипт, который считывает закрытый ключ и создаёт из этого закрытого ключа кошелёк wallet
    После чего подписывается на новые транзакции в сети, но выводит в терминал только транзакции, исходящие или входящие на адрес wallet
    Совершите в скрипте одну транзакцию исходящую с wallet и одну транзакцию  входящую на wallet

    Запуск: npx nestjs-command t57:task1
    */
    @Command({
        command: 't57:task1',
        describe: 'Задача 57.1',
    })
    async 57_1() {
        const provider = this.provider;
        const privateKey = readline.question(`Enter privateKey: `) || this.defaultKeys[0];
        const wallet = new ethers.Wallet(privateKey);

        provider.on('pending', async hash => {
            const tx = await provider.getTransaction(hash);

            if (tx.to == wallet.address || tx.from == wallet.address) {
                console.log('tx:', tx);
            }
        });

        const accounts = await provider.listAccounts();
        const signer = await provider.getSigner(accounts[0].address);

        const txRequestSigner = await signer.populateTransaction({
            to: wallet.address,
            value: this.values[0]
        });

        await (await signer.sendTransaction(txRequestSigner)).wait();

        const walletConnect = wallet.connect(provider);

        const txRequestWallet = await walletConnect.populateTransaction({
            to: signer.address,
            value: this.values[1]
        });

        await (await walletConnect.sendTransaction(txRequestWallet)).wait();

        process.exit();
    }

    /**
    Задача 2
    Напишите скрипт, который отслеживает появление новых блоков в сети и выводит в терминал следующую информацию о новых блоках:
     - номер блока
     - количество транзакций в блоке
     - общую сумму eth, пересылаемого во всех транзакциях блока

    Запуск: npx nestjs-command t57:task2
    */
    @Command({
        command: 't57:task2',
        describe: 'Задача 57.2',
    })
    async 57_2() {
        const provider = this.provider;

        provider.on('block', async blockNumber => {
            const { prefetchedTransactions } = await provider.getBlock(BigInt(blockNumber), true);
            const value = (() => {
                let sum = ethers.toBigInt(0);

                for(let tx of prefetchedTransactions) {
                    sum += tx.value;
                }

                return sum;
            })();

            console.log('blockNumber: ', blockNumber);
            console.log('txCount: ', prefetchedTransactions.length);
            console.log('txValue: ',  value);
        });

        const accounts = await provider.listAccounts();
        const signer = await provider.getSigner(accounts[0].address);

        const txRequest1 = await signer.populateTransaction({
            to: accounts[0].address,
            value: this.values[0]
        });

        await (await signer.sendTransaction(txRequest1)).wait();

        const txRequest2 = await signer.populateTransaction({
            to: accounts[0].address,
            value: this.values[1]
        });

        await (await signer.sendTransaction(txRequest2)).wait();

        process.exit();
    }

    /**
     * Main function for Task 57_3 and 57_4
     * 
     * @param filters 
     */
    async T57_3_4_Main(filters) {
        const contractName = 'T57_3';
        const provider = this.provider;
        const accounts = await this.provider.listAccounts();
        const signer = await provider.getSigner(accounts[0].address);

        const ABI = this.ethersService.getABI(contractName); 
        const bytecode = this.ethersService.getBytecode(contractName);

        const contractFactory = new ethers.ContractFactory(ABI, bytecode, signer);
        const contractDeployment = await (await contractFactory.deploy()).waitForDeployment();

        Object.keys(filters).map(name => {
            const filter = {...filters[name], ...{ address: contractDeployment.target }};

            provider.on(filter, log => {
                console.log(`${name} event start:`);
                console.log(log);
                console.log(`${name} event end.`);
            });
        });

        const txRequest = await signer.populateTransaction({
            to: contractDeployment.target,
            value: this.values[0]
        });

        await (await signer.sendTransaction(txRequest)).wait();
        
        await contractDeployment['setData'](100, 'Test', [1,2,3]);

        (async () => {
            const signer = await provider.getSigner(accounts[1].address);
            const contract = contractDeployment.connect(signer);
            await contract['setData'](200, 'Test', [1,2,3]);
        })();
    }

    /**
    Задача 3

    Напишите контракт, который содержит два ивента:
    Receive(address indexed sender, uint256 indexed value);
    SetData(uint256 indexed number, string str, uint256[] data);
    А также функции
    receive(){}
    setData(uint256 number, string str, uint256[] data){}
    В которых вызываются указанные выше ивенты
    Напишите скрипт, который развернёт этот контракт в тестовой или локальной сети (например, Ganache) 
    А затем подпишется на оба события
    Создайте пару транзакций с вызовом указанных функций, убедитесь, что в терминал выводится информация о срабатывании событий
    
    Запуск: npx nestjs-command t57:task3
    */
    @Command({
        command: 't57:task3',
        describe: 'Задача 57.3',
    })
    async 57_3() {
        await this.T57_3_4_Main({
            'Receive': {
                topics: [
                    ethers.id("Receive(address,uint256)")
                ]
            },
            'SetData': {
                topics: [
                    ethers.id("SetData(uint256,string,uint256[])")
                ]
            }
        });
    }

    /**
    Задача 4

    Модифицируйте предыдущий скрипт
    Настройте фильтр для событий таким образом, чтобы отслеживались события только для определённых значений sender и number 
    
    Запуск: npx nestjs-command t57:task4
    */
    @Command({
        command: 't57:task4',
        describe: 'Задача 57.4',
    })
    async 57_4() {
        const accounts = await this.provider.listAccounts();

        await this.T57_3_4_Main({
            'Receive': {
                topics: [
                    ethers.id("Receive(address,uint256)"),
                    ethers.zeroPadValue(ethers.hexlify(accounts[1].address), 32)
                ]
            },
            'SetData': {
                topics: [
                    ethers.id("SetData(uint256,string,uint256[])"),
                    ethers.zeroPadValue(ethers.toBeHex(200), 32)
                ]
            }
        });
    }
}
