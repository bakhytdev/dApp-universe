import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";

@Injectable()
export class T54 {

    /**
    
    Запуск: npx nestjs-command t54:task1
    */
    @Command({
        command: 't54:task1',
        describe: 'Задача 54.1',
    })
    async T54_1() {
        
    }

    /**
    
    Запуск: npx nestjs-command t54:task2
    */
    @Command({
        command: 't54:task2',
        describe: 'Задача 54.2',
    })
    async T54_2() {
        
    }

    /**
    
    Запуск: npx nestjs-command t54:task3
    */
    @Command({
        command: 't54:task3',
        describe: 'Задача 54.3',
    })
    async T54_3() {
        
    }

    /**
    
    Запуск: npx nestjs-command t54:task4
    */
    @Command({
        command: 't54:task4',
        describe: 'Задача 54.4',
    })
    async T54_4() {
        
    }

    /**
    
    Запуск: npx nestjs-command t54:task5
    */
    @Command({
        command: 't54:task5',
        describe: 'Задача 54.5',
    })
    async T54_5() {
        
    }

    /**
    
    Запуск: npx nestjs-command t54:task6
    */
    @Command({
        command: 't54:task6',
        describe: 'Задача 54.6',
    })
    async T54_6() {
        
    }
}

/**
ИЗ Аккаунтов

Задача 1

Напишите скрипт, который принимает на вход строку для энтропии, создаёт нового подписанта и выводит в терминал его адрес и приватный ключ


Задача 2

Напишите скрипт, который принимает на закрытый ключ, создаёт нового подписанта и выводит в терминал его адрес и публичный ключ


Задача 3

Напишите скрипт, который принимает ендпоинт узла (https://…) создаёт RpcProvider, получает список подписантов, управляемых узлом и выводит их в консоль


Задача 4

Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value

    • создаёт нового подписанта signer из privateKey
    • создаёт нового провайдера provider подключённого к ganache
    • пополняет баланс аккаунта signer с любого аккаунта из ganache
    • отправляет value с баланса signer на баланс  recipient


Задача 5

Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value

    • создаёт нового подписанта signer из privateKey
    • создаёт нового провайдера provider подключённого к тестовой сети Goerli
    • локально подписывает транзакцию отправки value с баланса signer на баланс  recipient
    • отправляет подписанную транзакцию в сеть с использование провайдера


Задача 6

Напишите скрипт, который запрашивает закрытый ключ privateKey, адрес recipient и value

    • создаёт нового подписанта signer из privateKey
    • создаёт нового провайдера provider подключённого к тестовой сети Goerli
    • отправляет value с баланса signer на баланс  recipient
    • для отправки транзакции используйте метод подписанта
*/