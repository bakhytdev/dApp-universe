import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";

@Injectable()
export class T55 {

    /**
    
    Запуск: npx nestjs-command 55:task1
    */
    @Command({
        command: '55:task1',
        describe: 'Задача 54.1',
    })
    async 55_1() {
        
    }

    /**
    
    Запуск: npx nestjs-command 55:task2
    */
    @Command({
        command: '55:task2',
        describe: 'Задача 54.2',
    })
    async 55_2() {
        
    }

    /**
    
    Запуск: npx nestjs-command 55:task3
    */
    @Command({
        command: '55:task3',
        describe: 'Задача 54.3',
    })
    async 55_3() {
        
    }

    /**
    
    Запуск: npx nestjs-command 55:task4
    */
    @Command({
        command: '55:task4',
        describe: 'Задача 54.4',
    })
    async 55_4() {
        
    }

    /**
    
    Запуск: npx nestjs-command 55:task5
    */
    @Command({
        command: '55:task5',
        describe: 'Задача 54.5',
    })
    async 55_5() {
        
    }

    /**
    
    Запуск: npx nestjs-command 55:task6
    */
    @Command({
        command: '55:task6',
        describe: 'Задача 54.6',
    })
    async 55_6() {
        
    }
}