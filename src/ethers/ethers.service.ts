import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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
}