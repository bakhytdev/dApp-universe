import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ExampleCommand } from './web3/commands/example.command';
import { Web3Module } from './web3/web3.module';
import { Web3Service } from './web3/web3.service';
import { T29 } from './web3/commands/t29.command';
import { T31 } from './web3/commands/T31.command';
import { T32 } from './web3/commands/T32.command';
import { T34 } from './web3/commands/T34.command';
import { T35 } from './web3/commands/T35.command';
import { T37 } from './web3/commands/T37.command';
import { T38 } from './web3/commands/T38.command';
import { EthersService } from './ethers/ethers.service';
import { EthersCommand } from './ethers/commands/ethers.command';
import { T52 } from './ethers/commands/T52.command';
import { T54 } from './ethers/commands/T54.command';
import { T55 } from './ethers/commands/T55.command';
import { T57 } from './ethers/commands/T57.command';
import { T58 } from './ethers/commands/T58.command';
import { T60 } from './ethers/commands/T60.command';

@Module({
  imports: [
    CommandModule, 
    Web3Module, 
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    })
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    Web3Service, 
    ExampleCommand, 
    //T29, T31, T32, T34, T35, T37, T38, 
    EthersService,
    EthersCommand,
    T52, T54, T55, T57, T58, T60
  ],
})
export class AppModule {}
