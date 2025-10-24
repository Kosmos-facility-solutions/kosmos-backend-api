import { Controller, Get } from '@nestjs/common';
import * as net from 'net';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('test-smtp-ports')
  async testSmtpPorts() {
    const ports = [587, 465, 25];
    const results = [];

    for (const port of ports) {
      const result = await new Promise<any>((resolve) => {
        const client = net.createConnection(
          {
            host: 'smtp.gmail.com',
            port,
            timeout: 3000,
          },
          () => {
            client.end();
            resolve({ port, status: 'OPEN ✅' });
          },
        );

        client.on('timeout', () => {
          client.destroy();
          resolve({ port, status: 'BLOCKED ❌ (timeout)' });
        });

        client.on('error', (err: any) => {
          resolve({ port, status: `BLOCKED ❌: ${err.message}` });
        });
      });

      results.push(result);
    }

    return { results };
  }
}
