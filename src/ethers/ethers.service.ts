import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EthersService {
    private ALCHEMY_API_KEY: string;
    private CONTRACT_DIR: string;

    constructor(private configService: ConfigService) {
        this.ALCHEMY_API_KEY = this.configService.get<string>('ALCHEMY_API_KEY');
        this.CONTRACT_DIR = `${__dirname}/contracts`
    }
}