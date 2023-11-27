import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { ethers } from "ethers";
import { EthersService } from "../ethers.service";

@Injectable()
export class T58 {
    provider;

    constructor(
        private readonly ethersService: EthersService
    ) {
        this.provider = new ethers.JsonRpcProvider(this.ethersService.getGanacheHost());
    }

    /**
    Запуск: npx nestjs-command t58_1:compile
    */
    @Command({
        command: 't58_1:compile',
        describe: 'Скомпилировать контракт T58_1.sol',
    })
    async T35_1_compile() {
        this.ethersService.compile('T58_1_Caller.sol', ['T58_1_Caller']);
        this.ethersService.compile('T58_1_Respondent.sol', ['T58_1_Respondent']);
    }

    /**
    Задача 1

    Напишите два контракта Caller и Respondent
    Caller должен вызывать некоторую функцию target(uint256, address, string),  контракте Respondent при помощи низкоуровневого вызова.
    При этом в target() должен срабатывать некоторый ивент eventCall(uint256 indexed, address indexed, string)
    Напишите скрипт, который компилирует и деплоит контракты в сети.
    Затем, при помощи изученных методов создаст байтмассив с calldata для вызова target() и вместе с адресом контракта Respondent передаст в функцию call(address, bytes) контракта Caller. В этой функции и должен произойти вызов функции target() контракта Respondent
    Подпишитесь на событие eventCall()
    Сделайте вызов функции call()
    При помощи изученных в уроке методов декодируйте логи события и выведите результат в консоль
    Рекомендуется использовать класс интерфейс и его методы
    
    Запуск: npx nestjs-command t58:task1
    */
    @Command({
        command: 't58:task1',
        describe: 'Задача 58.1',
    })
    async 58_1() {
        const accounts = await this.provider.listAccounts();
        const signer = await this.provider.getSigner(accounts[0].address);

        const callerContractName = 'T58_1_Caller';
        const callerABI = this.ethersService.getABI(callerContractName);
        const callerBytecode = this.ethersService.getBytecode(callerContractName);
        const callerContractFactory = new ethers.ContractFactory(callerABI, callerBytecode, signer);
        const callerContractDeployment = await (await callerContractFactory.deploy()).waitForDeployment();

        const respondentContractName = 'T58_1_Respondent';
        const respondentABI = this.ethersService.getABI(respondentContractName);
        const respondentBytecode = this.ethersService.getBytecode(respondentContractName);
        const respondentContractFactory = new ethers.ContractFactory(respondentABI, respondentBytecode, signer);
        const respondentContractDeployment = await (await respondentContractFactory.deploy()).waitForDeployment();
        const respondentInterface = new ethers.Interface(respondentABI);

        (async () => {
            const topics = respondentInterface.encodeFilterTopics('TargetEvent', []);

            const filter = {
                address: respondentContractDeployment.target,
                topics
            };
    
            this.provider.on(filter, log => {
                console.log(`Event start:`);
                console.log(log);
                console.log(`Event end.`);

                console.log(respondentInterface.decodeEventLog('TargetEvent', log.data, log.topics));
            });
    
            const payload = respondentInterface.encodeFunctionData('target', [100]);
    
            const result = await callerContractDeployment['call'](respondentContractDeployment.target, payload);
    
            console.log(result);
        })();
    }

    /**
    Потренироваться работать с методами ethers.utils

    Запуск: npx nestjs-command t58:task2
    */
    @Command({
        command: 't58:task2',
        describe: 'Задача 58.2',
    })
    async 58_2() {
        const text = "Hello World!!";

        const strToUtf8Bytes = ethers.toUtf8Bytes(text);
        console.log('strToUtf8Bytes: ', strToUtf8Bytes);

        const strEncodeBase64 = ethers.encodeBase64(strToUtf8Bytes);
        console.log('strEncodeBase64: ', strEncodeBase64);

        const strDecodeBase64 = ethers.decodeBase64(strEncodeBase64);
        console.log(strDecodeBase64);

        const base64toUtf8String = ethers.toUtf8String(strDecodeBase64);
        console.log('base64toUtf8String: ', base64toUtf8String);

  
        const encodeBytes32String = ethers.encodeBytes32String(text);
        console.log('encodeBytes32String: ', encodeBytes32String);

        const isHexString = ethers.isHexString(encodeBytes32String);
        console.log(`isHexString: ${encodeBytes32String}`, isHexString);

        const toUtf8Bytes = ethers.toUtf8Bytes(text);
        console.log('toUtf8Bytes: ', toUtf8Bytes);

        const getBytes = ethers.getBytes(toUtf8Bytes);
        console.log('getBytes: ', getBytes);

        const hexlify = ethers.hexlify(toUtf8Bytes);
        console.log('hexlify: ', hexlify);

        process.exit();
    }
}
