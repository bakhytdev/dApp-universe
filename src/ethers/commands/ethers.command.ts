import { Injectable } from "@nestjs/common";
import { Command, Positional } from "nestjs-command";

/**
 * npx nestjs-command example:test 111 
 */
@Injectable()
export class EthersCommand {

    @Command({
        command: 'ethers:test <arg1>',
        describe: 'ethers test command',
    })
    async test(
        @Positional({
            name: 'arg1',
            describe: 'the username',
            type: 'string'
        })
        arg: string
    ) {
        console.log('Command test', arg);   
    }
}