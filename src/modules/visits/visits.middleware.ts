import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { VisitsService } from './visits.service.js';

@Injectable()
export class VisitsMiddleware implements NestMiddleware {
  constructor(private readonly visitsService: VisitsService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    // req.url in NestJS middleware does NOT include the global '/api' prefix.
    // e.g. request to /api/transfer/quote arrives here as /transfer/quote
    const url: string = req.baseUrl
    console.log('url', url);


    // Count ONLY transfer front-office requests.
    // - Must start with /transfer/
    // - Must NOT be an admin transfer route (/admin/transfer/)
    const isTransferRoute = url.startsWith('/api/transfer/');
    const isAdminTransferRoute = url.includes('/admin/transfer/');
    const shouldCount = isTransferRoute && !isAdminTransferRoute;
    console.log('shouldCount', shouldCount);

    if (shouldCount) {
      // Fire-and-forget — never block the request
      this.visitsService.recordVisit().catch(() => {/* ignore */});
    }

    next();
  }
}
