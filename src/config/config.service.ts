import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
	private readonly envConfig: { [key: string]: string };

	constructor(filePath: string) {
		this.envConfig = dotenv.parse(fs.readFileSync(filePath));
	}

	get(key: keyof IConfig): string {
		return this.envConfig[key];
	}
	getAll(): any {
		return this.envConfig;
	}
}

interface IConfig {
	app_name: string;
	client_url: string;
	allow_origins: string;
	gcp_project_id: string;
	gcp_keyfile: string;
	swagger: string;
}
