import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { VisitsService } from './visits.service.js';

@Injectable()
export class VisitsMiddleware implements NestMiddleware {
  constructor(private readonly visitsService: VisitsService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    // Only count actual user-facing requests — skip admin API calls
    // req.path in NestJS middleware does NOT include the global '/api' prefix,
    // so the actual path is e.g.  /admin/dashboard/stats  not /api/admin/...
    const path: string = req.url || req.path || '';
    const isAdminRoute = path.includes('/admin/');

    if (!isAdminRoute) {
      // Fire-and-forget — do not block the request
      this.visitsService.recordVisit().catch(() => {
        // Silently ignore errors so visit tracking never breaks the app
      });
    }

    next();
  }
}
