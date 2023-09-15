import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleCommand } from './web3/commands/example.command';
import { T29 } from './web3/commands/t29.command';
import { Web3Module } from './web3/web3.module';

@Module({
  imports: [CommandModule, Web3Module],
  controllers: [AppController],
  providers: [AppService, ExampleCommand, T29],
})
export class AppModule {}
