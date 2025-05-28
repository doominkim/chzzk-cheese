import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChatLog } from '../entities/channel-chat-log.entity';
import { EntityManager, InsertResult, Repository } from 'typeorm';
import { GenerateChannelChatLogDto } from '../dtos/generate-channel-cat-log.dto';
import { GetDonationRankDto } from '../dtos/get-donation-rank.dto';
import { GetDonationDto } from '../dtos/get-donation.dto';
import { GetActiveUserRankDto } from '../dtos/get-most-active-user-rank.dto';
import { Channel } from '../entities/channel.entity';
import { FindChannelChatDto } from '../dtos/find-channel-chat.dto';
import { ChannelLive } from '../entities/channel-live.entity';
import { FindChatDto } from '../dtos/find-chat.dto';
import { ChannelLiveCategory } from '../entities/channel-live-category.entity';

@Injectable()
export class ChannelChatLogRepository {
  constructor(
    @InjectRepository(ChannelChatLog)
    private repository: Repository<ChannelChatLog>,
  ) {}

  async generateChannelChatLog(
    generateChannelChatLogDto: GenerateChannelChatLogDto,
    entityManager?: EntityManager,
  ) {
    let instance: ChannelChatLog;
    if (entityManager) {
      instance = entityManager.create(ChannelChatLog, {
        ...generateChannelChatLogDto,
      });
    } else {
      instance = this.repository.create({
        ...generateChannelChatLogDto,
      });
    }

    return await this.repository.save(instance);
  }

  async generateChannelChatLogs(
    generateChannelChatLogDtos: GenerateChannelChatLogDto[],
    entityManager?: EntityManager,
  ) {
    if (entityManager) {
      return await entityManager.insert(
        ChannelChatLog,
        generateChannelChatLogDtos,
      );
    } else {
      return await this.repository.insert(generateChannelChatLogDtos);
    }
  }

  async getDonationRank(getDonationRankDto: GetDonationRankDto) {
    const { uuid, limit, fromCreatedAt, toCreatedAt } = getDonationRankDto;

    const query = this.repository
      .createQueryBuilder('ccl')
      .where(`(ccl.extras -> 'payAmount')::int > 0`);

    if (uuid) {
      query.leftJoinAndMapOne(
        'ccl.channel',
        Channel,
        'c',
        'ccl.channelId = c.id',
      );
      query.andWhere('c.uuid = :uuid', { uuid });
    }

    if (fromCreatedAt) {
      query.andWhere('ccl.createdAt >= :fromCreatedAt', { fromCreatedAt });
    }

    if (toCreatedAt) {
      query.andWhere('ccl.createdAt <= :toCreatedAt', { toCreatedAt });
    }

    if (limit) {
      query.limit(limit);
    } else {
      query.limit(10);
    }

    query
      .groupBy('ccl.nickname')
      .orderBy('"donateAmount"', 'DESC')
      .select(
        `(CASE WHEN ccl.nickname IS NULL THEN '익명의 후원자' ELSE ccl.nickname END)`,
        'nickname',
      )
      .addSelect("sum((ccl.extras -> 'payAmount')::int)::int", 'donateAmount')
      .addSelect('count(*)::int', 'donateCount');

    return await query.getRawMany();
  }
  async getDonations(getDonationDto: GetDonationDto) {
    const { uuid, fromCreatedAt, toCreatedAt, limit } = getDonationDto;

    const query = this.repository
      .createQueryBuilder('ccl')
      .where(`ccl."chatType" = 'DONATION'`);

    if (uuid) {
      query.leftJoinAndMapOne(
        'ccl.channel',
        Channel,
        'c',
        'ccl.channelId = c.id',
      );
      query.andWhere('c.uuid = :uuid', { uuid });
    }

    if (fromCreatedAt) {
      query.andWhere('ccl.createdAt >= :fromCreatedAt', { fromCreatedAt });
    }

    if (toCreatedAt) {
      query.andWhere('ccl.createdAt <= :toCreatedAt', { toCreatedAt });
    }

    query
      .orderBy('ccl.createdAt', 'DESC')
      .select(`ccl.createdAt`, 'createdAt')
      .addSelect('ccl.nickname', 'nickname')
      .addSelect(`ccl.profile -> 'activityBadges'`, 'badges')
      .addSelect(`(ccl.extras -> 'payAmount')::int`, 'payAmount')
      .addSelect(`ccl.message`, 'message');

    if (limit) {
      query.limit(limit);
    } else {
      query.limit(10);
    }

    return await query.getRawMany();
  }
  async getActiveUserRank(getActiveUserRank: GetActiveUserRankDto) {
    const { uuid, fromCreatedAt, toCreatedAt, limit } = getActiveUserRank;

    const query = this.repository.createQueryBuilder('ccl');

    if (uuid) {
      query.leftJoinAndMapOne(
        'ccl.channel',
        Channel,
        'c',
        'ccl.channelId = c.id',
      );
      query.andWhere('c.uuid = :uuid', { uuid });
    }

    if (fromCreatedAt) {
      query.andWhere('ccl.createdAt >= :fromCreatedAt', { fromCreatedAt });
    }

    if (toCreatedAt) {
      query.andWhere('ccl.createdAt <= :toCreatedAt', { toCreatedAt });
    }

    if (limit) {
      query.limit(limit);
    } else {
      query.limit(10);
    }

    query
      .groupBy('ccl.nickname')
      .orderBy('"chatCount"', 'DESC')
      .select('ccl.nickname', 'nickname')
      .addSelect('count(*)::int', 'chatCount');

    return await query.getRawMany();
  }

  async findChats(
    uuid: string,
    chatChannelId: string,
    findDto: FindChannelChatDto,
  ) {
    const { limit, from, to, message, userIdHash, nickname, chatType } =
      findDto;

    const query = this.repository
      .createQueryBuilder('ccl')
      .leftJoinAndMapOne('ccl.channel', Channel, 'c', 'ccl.channelId = c.id')
      .where('c.uuid = :uuid', { uuid })
      .andWhere('ccl.chatChannelId = :chatChannelId', { chatChannelId });

    if (from) {
      query.andWhere('ccl.createdAt >= :from', { from });
    }

    if (to) {
      query.andWhere('ccl.createdAt <= :to', { to });
    }

    if (message) {
      query.andWhere('ccl.message LIKE :message', { message });
    }

    if (userIdHash) {
      query.andWhere('ccl.userIdHash = :userIdHash', { userIdHash });
    }

    if (nickname) {
      query.andWhere('ccl.nickname = :nickname', { nickname });
    }

    if (chatType) {
      query.andWhere('ccl.chatType = :chatType', { chatType });
    }

    query.orderBy('ccl.createdAt', 'DESC');

    const pageSize = Math.min(limit || 20, 40);
    query.limit(pageSize);

    const [items, total] = await query.getManyAndCount();

    const sortedItems = items.reverse();

    return {
      items: sortedItems,
      total,
      hasMore: items.length === pageSize,
    };
  }

  async findChatsV2(findDto: FindChatDto) {
    const {
      uuid,
      chatChannelId,
      limit,
      from,
      to,
      message,
      userIdHash,
      nickname,
      chatType,
    } = findDto;

    const query = this.repository
      .createQueryBuilder('ccl')
      .leftJoinAndMapOne('ccl.channel', Channel, 'c', 'ccl.channelId = c.id')
      .leftJoinAndMapOne(
        'ccl.channelLive',
        ChannelLive,
        'cl',
        'cl.chatChannelId = ccl.chatChannelId',
      )
      .leftJoinAndMapOne(
        'cl.liveCategory',
        ChannelLiveCategory,
        'clc',
        'clc.id = cl.liveCategoryId',
      );

    if (uuid) {
      query.where('c.uuid = :uuid', { uuid });
    }

    if (chatChannelId) {
      query.andWhere('ccl.chatChannelId = :chatChannelId', { chatChannelId });
    }

    if (from) {
      query.andWhere('ccl.createdAt >= :from', { from });
    }

    if (to) {
      query.andWhere('ccl.createdAt <= :to', { to });
    }

    if (message) {
      query.andWhere('ccl.message LIKE :message', { message });
    }

    if (userIdHash) {
      query.andWhere('ccl.userIdHash = :userIdHash', { userIdHash });
    }

    if (nickname) {
      query.andWhere('ccl.nickname = :nickname', { nickname });
    }

    if (chatType) {
      query.andWhere('ccl.chatType = :chatType', { chatType });
    }

    query.orderBy('ccl.createdAt', 'DESC');

    const pageSize = Math.min(limit || 20, 40);
    query.limit(pageSize);

    const [items, total] = await query.getManyAndCount();

    const sortedItems = items.reverse();

    return {
      items: sortedItems,
      total,
      hasMore: items.length === pageSize,
    };
  }
}
