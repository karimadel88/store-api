import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from './schemas/visit.schema.js';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private visitModel: Model<Visit>,
  ) {}

  /** Returns midnight UTC for today */
  private todayMidnight(): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  /** Increments today's visit count by 1 (upsert). */
  async recordVisit(): Promise<void> {
    const date = this.todayMidnight();
    await this.visitModel
      .findOneAndUpdate(
        { date },
        { $inc: { count: 1 } },
        { upsert: true, new: true },
      )
      .exec();
  }

  /** Returns daily visit counts for the last 30 days. */
  async getLast30Days(): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);

    const docs = await this.visitModel
      .find({ date: { $gte: since } })
      .sort({ date: 1 })
      .lean()
      .exec();

    // Build a full 30-day array (fill gaps with 0)
    const result: { date: string; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const found = docs.find(
        (doc) => doc.date.toISOString().slice(0, 10) === iso,
      );
      result.push({ date: iso, count: found?.count ?? 0 });
    }
    return result;
  }

  /** Returns the all-time total visit count. */
  async getTotalVisits(): Promise<number> {
    const result = await this.visitModel
      .aggregate([{ $group: { _id: null, total: { $sum: '$count' } } }])
      .exec();
    return result[0]?.total ?? 0;
  }
}
