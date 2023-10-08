import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Web3 from "web3";
import * as fs from 'fs';
import * as path from 'path';
import solc from "solc";

@Injectable()
export class Web3Service {
    private ALCHEMY_API_KEY: string;
    private CONTRACT_DIR: string;

    constructor(private configService: ConfigService) {
        this.ALCHEMY_API_KEY = this.configService.get<string>('ALCHEMY_API_KEY');
        this.CONTRACT_DIR = `${__dirname}/contracts`
    }

    alchemy() {
        return new Web3(`https://eth-goerli.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`);
    }

    ganache() {
        return new Web3(`http://127.0.0.1:7545`);
    }

    compile(contractName) {     
        const fileName = `${contractName}.sol`
        const contractCode = fs.readFileSync(path.join(this.CONTRACT_DIR, fileName), 'utf-8');        
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

        //solc.loadRemoteVersion('0.8.19+commit.7dd6d404.Emscripten.clang');
        
        const output = JSON.parse(solc.compile(JSON.stringify(input)));        
        
        //console.log("Compilation result: ", output.contracts[fileName]);
    
        const ABI = output.contracts[fileName][contractName].abi;
        const bytecode = output.contracts[fileName][contractName].evm.bytecode.object;

        // console.log(ABI)
        // console.log(bytecode)
    
        fs.writeFileSync(`${this.CONTRACT_DIR}/${contractName}.abi`, JSON.stringify(ABI));
        fs.writeFileSync(`${this.CONTRACT_DIR}/${contractName}.bin`, bytecode);
    }

    getABI(contractName) {
        return JSON.parse(fs.readFileSync(path.join(this.CONTRACT_DIR, `${contractName}.abi`), 'utf-8'));
    }

    getBytecode(contractName) {
        return fs.readFileSync(path.join(this.CONTRACT_DIR, `${contractName}.bin`), 'utf-8')
    }
}