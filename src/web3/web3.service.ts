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
        return new Web3(`http://localhost:7545`);
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