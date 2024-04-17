import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChatLog } from '../entities/channel-chat-log.entity';
import { Repository } from 'typeorm';
import { GenerateChannelChatLogDto } from '../dtos/generate-channel-cat-log.dto';
import { GetDonationRankDto } from '../dtos/get-donation-rank.dto';
import { GetDonationDto } from '../dtos/get-donation.dto';
import { GetActiveUserRankDto } from '../dtos/get-most-active-user-rank.dto';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class ChannelChatLogRepository {
  constructor(
    @InjectRepository(ChannelChatLog)
    private repository: Repository<ChannelChatLog>,
  ) {}

  async generateChannelChatLog(
    generateChannelChatLogDto: GenerateChannelChatLogDto,
  ) {
    const instance = this.repository.create({
      ...generateChannelChatLogDto,
    });

    return await this.repository.save(instance);
  }

  async getDonationRank(getDonationRankDto: GetDonationRankDto) {
    const { uuid, limit, fromCreatedAt, toCreatedAt } = getDonationRankDto;

    const query = this.repository
      .createQueryBuilder('ccl')
      .groupBy('ccl.nickname')
      .orderBy('count(*)', 'DESC')
      .select(
        `(CASE WHEN ccl.nickname IS NULL THEN '익명의 후원자' ELSE ccl.nickname END)`,
        'nickname',
      )
      .addSelect("sum((ccl.extras -> 'payAmount')::int)::int", 'donateAmount')
      .addSelect('count(*)::int', 'donateCount')
      .where(`(ccl.extras -> 'payAmount')::int > 0`);

    if (fromCreatedAt) {
      query.andWhere('ccl.createdAt >= :fromCreatedAt', { fromCreatedAt });
    }

    if (toCreatedAt) {
      query.andWhere('ccl.createdAt <= :toCreatedAt', { toCreatedAt });
    }

    if (uuid) {
      query.leftJoinAndMapOne(
        'ccl.channel',
        Channel,
        'c',
        'ccl.channelId = c.id',
      );
      query.andWhere('c.uuid = :uuid', { uuid });
    }

    if (limit) {
      query.limit(limit);
    } else {
      query.limit(10);
    }

    return await query.getRawMany();
  }
  async getDonations(getDonationDto: GetDonationDto) {
    const { channelId } = getDonationDto;
    const query = `
    SELECT to_char(ccl."createdAt", 'YY/MM/DD HH24:MI') "donatedAt", ccl.nickname, ccl.profile -> 'activityBadges' "badges", (ccl.extras -> 'payAmount')::int "donateAmount", message  FROM "channelChatLog" ccl
    WHERE ccl."chatType" = 'DONATION' AND ccl."channelId" = ${channelId} AND to_char(now(), 'YYYYMMDD') = to_char(ccl."createdAt", 'YYYYMMDD')
    ORDER BY ccl."createdAt" DESC
    `;

    return await this.repository.query(query);
  }
  async getActiveUserRank(getActiveUserRank: GetActiveUserRankDto) {
    const { channelId } = getActiveUserRank;
    const query = `
    SELECT ccl.nickname, count(*) "chatCount" FROM "channelChatLog" ccl
    WHERE "channelId" = ${channelId}
    GROUP BY nickname
    ORDER BY "chatCount" DESC
    LIMIT 10
    `;

    return await this.repository.query(query);
  }
}
