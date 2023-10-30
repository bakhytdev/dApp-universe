import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';

@Module({
    providers: [EthersService]
})
export class Web3Module {}

