import { Injectable } from "@nestjs/common";
import { Command, Positional } from "nestjs-command";

/**
 * npx nestjs-command example:test 111 
 */
@Injectable()
export class ExampleCommand {

    @Command({
        command: 'example:test <arg1>',
        describe: 'example test command',
    })
    async test(
        @Positional({
            name: 'arg1',
            describe: 'the username',
            type: 'string'
        })
        arg: string
    ) {
        console.log('testttt', arg);   
    }
}