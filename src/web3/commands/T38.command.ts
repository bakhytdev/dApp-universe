import { Injectable, StreamableFile } from "@nestjs/common";
import { Command } from "nestjs-command";
import * as readline from "readline-sync";
import { Web3Service } from "../web3.service";
import BN from "bn.js";

@Injectable()
export class T38 {
    web3: any;
    contract: string;

    defaultKeys = [
        "0xc2384fa7ecd685215652b379a6b359022ccdbfbc5982b49686c57943a763b55f",
        "0x5a0629b0e398b48d467e4a507c442f7da09679b3264abfa723616406d31c3323"
    ];

    constructor(
        private readonly web3Service: Web3Service     
    ) {
        this.web3 = this.web3Service.ganacheWS();
    }

    /**
    Запуск: npx nestjs-command t38_1:compile
    */
    @Command({
        command: 't38_1:compile',
        describe: 'Скомпилировать контракт t38_1.sol',
    })
    async T35_3_compile() {
        this.web3Service.compile('T38_1_Caller.sol', ['T38_1_Caller']);
        this.web3Service.compile('T38_1_Respondent.sol', ['T38_1_Respondent']);
    }

    /**
    Задача 1

    Напишите два контракта Caller и Respondent
    Caller должен вызывать некоторую функцию target(uint256, address, string),  контракте Respondent при помощи низкоуровневого вызова.
    При этом в target() должен срабатывать некоторый ивент eventCall(uint256 indexed, address indexed, string)

    Напишите скрипт, который компилирует и деплоит контракты в сети.
    Затем, при помощи изученных методов создаст байтмассив с calldata для вызова target() и вместе с адресом контракта Respondent передаст в функцию call(address, bytes) контракта Caller. 
    В этой функции и должен произойти вызов функции target() контракта Respondent
    Подпишитесь на событие eventCall()
    Сделайте вызов функции call()

    При помощи изученных в уроке методов декодируйте логи события и выведите результат в консоль

    Запуск: npx nestjs-command t38:task1
    */
    @Command({
        command: 't38:task1',
        describe: 'Задача 38.1',
    })
    async T38_1() {
        const contractNameCaller = 'T38_1_Caller';
        const privateKeyCaller:string = readline.question("Enter private key Caller: ") || this.defaultKeys[0];
        const accountCaller = this.web3.eth.accounts.privateKeyToAccount(privateKeyCaller);
        const ABICaller = this.web3Service.getABI(contractNameCaller); 
        const bytecodeCaller = this.web3Service.getBytecode(contractNameCaller); 
        const contractCaller = new this.web3.eth.Contract(ABICaller);
        const instanceCaller = await contractCaller.deploy({ data: bytecodeCaller }).send({ 
            from: accountCaller.address, 
            gas: 1_000_000 
        });

        this.web3.eth.defaultAccount = accountCaller.address;

        const contractNameRespondent = 'T38_1_Respondent';
        const privateKeyRespondent:string = readline.question("Enter private key Respondent: ") || this.defaultKeys[1];
        const accountRespondent = this.web3.eth.accounts.privateKeyToAccount(privateKeyRespondent);
        const ABIRespondent= this.web3Service.getABI(contractNameRespondent); 
        const bytecodeRespondent = this.web3Service.getBytecode(contractNameRespondent); 
        const contractRespondent = new this.web3.eth.Contract(ABIRespondent);
        const instanceRespondent = await contractRespondent.deploy({ data: bytecodeRespondent }).send({ 
            from: accountRespondent.address, 
            gas: 1_000_000 
        });

        const calldata = this.web3.eth.abi.encodeFunctionCall({
            name: 'target',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'x'
            }]
        }, [100]);

        const event = this.web3.utils.sha3("TargetEvent(uint256)");

        const subscription = instanceRespondent.events.TargetEvent({ topics: [event] });

        subscription.on('error', error => console.log('Error: ', error));
        subscription.on('data', async log => console.log(log.event, log));
        
        await instanceCaller.methods.call(instanceRespondent.options.address, calldata).send({
            from: accountCaller.address,
            gas: 1_000_000 
        })
        .on('receipt', console.log).then(console.log);
    }

    /**
    Задание 2

    Потренироваться работать с методами web3.utils
    Изучить документацию по BN.js https://github.com/indutny/bn.js/
    
    Запуск: npx nestjs-command t38:task1
    */
    @Command({
        command: 't38:task2',
        describe: 'Задача 38.2',
    })
    async T38_2() {
        const utils = this.web3.utils;
        const number = 123456789;

        const getHex = utils.randomHex(32);
        console.log('randomHex: ', getHex);

        const getSha3 = utils.sha3('test word');
        console.log('sha3: ', getSha3);

        const getSoliditySha3 = utils.soliditySha3({ t: "uint256", v: 12345 });
        console.log('soliditySha3', getSoliditySha3);
        
        const isHex = utils.isHex(number);
        console.log(number, ' isHex: ', isHex);
        
        const address = "0x9345dbd949cce40a5a7cf59c0eb87f5aae98f9a2";
        console.log('address: ', address);
        console.log('toChecksumAddress: ', utils.toChecksumAddress(address));
        
        console.log('numberToHex: ', utils.numberToHex(number));

        console.log('Gwei toWei: ', utils.toWei('100', 'Gwei'));
        
        console.log('BN', new BN(number).toString());

        const a = new BN('dead', 16);
        const b = new BN('101010', 2);
        var res = a.add(b);
        console.log(res.toString(10)); 
    }
}