import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
} from '@nestjs/terminus';
import { Public } from 'src/decorator/customize';

@Controller('health')
@Public()
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([]);
    }
}