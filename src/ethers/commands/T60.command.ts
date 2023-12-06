import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { ethers } from "ethers-v5";
import { EthersService } from "../ethers.service";

@Injectable()
export class T60 {
    constructor(
        private readonly ethersService: EthersService
    ) {}

    /**
    Задача 1

    Напишите скрипт, который выполняет следующие действия:
    Подключается к Ganache и получает Signer из провайдера
    Отправляет от имени этого signer транзакцию с некоторым количеством эфира на другой адрес
    По хеша транзакции получает транзакцию
    Восстанавливает подпись из v r s
    Восстанавливает transactionResponse из параметров транзакции
    Недостающие параметры transactionResponse  восстанавливает из параметров провайдера
    Вычисляет сериализованную транзакцию
    Вычисляет raw-транзакцию
    Получает хеш и/или digest из raw-транзакции
    Восстанавливает адрес и публичный ключ того, кто отправил транзакцию
    Восстанавливает адрес из публичного ключа
    Проверяет, что адреса восстановлены правильно

    Запуск: npx nestjs-command t60:task1
     */
    @Command({
        command: 't60:task1',
        describe: 'Задача 60.1',
    })
    async T60_1() {
        const provider = new ethers.providers.JsonRpcProvider(this.ethersService.getGanacheHost());
        const accounts = await provider.listAccounts();
        const signer = provider.getSigner(accounts[0]);

        const req = await signer.populateTransaction({
            to: accounts[1],
            value: 1000000000000
        });

        console.log('txRequest: ', req);

        const res = await (await signer.sendTransaction(req)).wait();

        console.log('txResponse: ', res);

        const tx = await provider.getTransaction(res.transactionHash);

        console.log('tx: ', tx);

        const sign = {
            v: tx.v,
            r: tx.r,
            s: tx.s,
        }

        const signature = ethers.utils.joinSignature(sign);

        console.log('Signature: ', signature);

        const txRecover = {
            to: tx.to,
            data: tx.data,
            type: tx.type,
            value: tx.value,
            nonce: tx.nonce,
            chainId: tx.chainId,
            gasLimit: tx.gasLimit,
            maxFeePerGas: tx.maxFeePerGas,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        };

        const serialized = ethers.utils.serializeTransaction(txRecover);

        console.log('Serialize: ', serialized);

        const txHash = ethers.utils.keccak256(serialized);

        console.log('txHash: ', txHash);

        const digest = ethers.utils.arrayify(txHash);

        console.log('digest: ', digest);

        const recoveredPublicKey = ethers.utils.recoverPublicKey(digest, signature);
        const recoveredAddress = ethers.utils.recoverAddress(digest, signature);
        const computedAddress = ethers.utils.computeAddress(recoveredPublicKey);

        console.log('Signer address: ', await signer.getAddress());

        console.log('recoveredPublicKey: ', recoveredPublicKey);
        console.log('recoveredAddress: ', recoveredAddress);
        console.log('computedAddress: ', computedAddress);
    }
}
