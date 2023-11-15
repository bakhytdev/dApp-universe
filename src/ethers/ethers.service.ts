import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';
import * as path from 'path';
import solc from "solc";

@Injectable()
export class EthersService {
    private ALCHEMY_API_URI: string;
    private ALCHEMY_API_KEY: string;
    private GANACHE_HOST: string;
    private CONTRACT_DIR: string;

    constructor(private configService: ConfigService) {
        this.ALCHEMY_API_URI = this.configService.get<string>('ALCHEMY_API_URI');
        this.ALCHEMY_API_KEY = this.configService.get<string>('ALCHEMY_API_KEY');
        this.GANACHE_HOST = this.configService.get<string>('GANACHE_HOST');
        this.CONTRACT_DIR = `${__dirname}/contracts`
    }

    getGanacheHost() {
        return this.GANACHE_HOST;
    }

    getGoerliKey() {
        return this.ALCHEMY_API_KEY;
    }

    getGoerliHost() {
        return `${this.ALCHEMY_API_URI}${this.ALCHEMY_API_KEY}`;
    }

    compile(fileName, contractNames) {     
        const contractDir = this.CONTRACT_DIR;
        const contractCode = fs.readFileSync(path.join(contractDir, fileName), 'utf-8');        
        // настраиваем структуру input для компилятора
        const input = {
            language: 'Solidity',
            sources: {
                [fileName]: {
                content: contractCode
            }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                }
            }
        }

        solc.loadRemoteVersion('v0.8.19+commit.7dd6d404', function(err, solcSnapshot) {            
            const output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)));        
            
            console.log("Compilation result: ", output.contracts[fileName]);
        
            contractNames.map((contractName) => {
                const ABI = output.contracts[fileName][contractName].abi;
                const bytecode = output.contracts[fileName][contractName].evm.bytecode.object;
    
                // console.log(ABI)
                // console.log(bytecode)
            
                fs.writeFileSync(`${contractDir}/${contractName}.abi`, JSON.stringify(ABI));
                fs.writeFileSync(`${contractDir}/${contractName}.bin`, bytecode);
            })
        });
    }

    getABI(contractName) {
        return JSON.parse(fs.readFileSync(path.join(this.CONTRACT_DIR, `${contractName}.abi`), 'utf-8'));
    }

    getBytecode(contractName) {
        return fs.readFileSync(path.join(this.CONTRACT_DIR, `${contractName}.bin`), 'utf-8').toString();
    }
}