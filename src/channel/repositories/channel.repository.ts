import { Repository, UpdateResult } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { Injectable } from '@nestjs/common';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLive } from '../entities/channel-live.entity';
import { ChannelLiveLog } from '../entities/channel-live-log.entity';
import { FindChannelDto } from '../dtos/find-channel.dto';
import {
  FindChannelDtoV2,
  ChannelSortField,
} from '../dtos/find-channel-v2.dto';
import { ChannelChatLog } from '../entities/channel-chat-log.entity';

@Injectable()
export class ChannelRepository {
  constructor(
    @InjectRepository(Channel)
    private repository: Repository<Channel>,
  ) {}

  async findChannels(findChannelDto: FindChannelDto): Promise<Channel[]> {
    const { channelName, isChatCollected, openLive } = findChannelDto;
    const query = this.repository
      .createQueryBuilder('c')
      .leftJoinAndMapOne(
        'c.channelLive',
        ChannelLive,
        'cl',
        'cl.channelId = c.id',
      )
      // .leftJoinAndMapOne(
      //   'cl.liveLog',
      //   ChannelLiveLog,
      //   'cll',
      //   'cll.channelLiveId = cl.id',
      // )
      .leftJoinAndSelect('cl.liveCategory', 'clc')
      .where('1=1')
      .orderBy('c.openLive', 'DESC')
      .addOrderBy('cl.updatedAt', 'DESC');
    // .addOrderBy('cll.createdAt', 'DESC');

    if (channelName) {
      query.andWhere('c.channelName ILIKE :channelName', {
        channelName: `%${channelName}%`,
      });
    }

    if (isChatCollected) {
      query.andWhere('c.isChatCollected = :isChatCollected', {
        isChatCollected,
      });
    }

    if (openLive) {
      query.andWhere('c.openLive = :openLive', { openLive });
    }

    return await query.getMany();
  }
  async findChannelsForBatch(
    findChannelDto: FindChannelDto,
  ): Promise<Channel[]> {
    const { channelName, isChatCollected, openLive } = findChannelDto;
    const query = this.repository
      .createQueryBuilder('c')
      .leftJoinAndMapOne(
        'c.channelLive',
        ChannelLive,
        'cl',
        'cl.channelId = c.id',
      )
      .leftJoinAndMapOne(
        'cl.liveLog',
        ChannelLiveLog,
        'cll',
        'cll.channelLiveId = cl.id',
      )
      .leftJoinAndSelect('cl.liveCategory', 'clc')
      .where('1=1')
      .orderBy('c.openLive', 'DESC')
      .addOrderBy('cl.updatedAt', 'DESC');

    if (channelName) {
      query.andWhere('c.channelName ILIKE :channelName', {
        channelName: `%${channelName}%`,
      });
    }

    if (isChatCollected) {
      query.andWhere('c.isChatCollected = :isChatCollected', {
        isChatCollected,
      });
    }

    if (openLive) {
      query.andWhere('c.openLive = :openLive', { openLive });
    }

    return await query.getMany();
  }

  async findChannelById(id: number): Promise<Channel> {
    return await this.repository
      .createQueryBuilder('c')
      .where('c.id = :id', { id })
      .getOne();
  }

  async findChannelByUUID(uuid: string): Promise<Channel> {
    return await this.repository
      .createQueryBuilder('c')
      .leftJoinAndMapOne(
        'c.channelLive',
        ChannelLive,
        'cl',
        'cl.channelId = c.id',
      )
      .leftJoinAndMapOne(
        'cl.liveLog',
        ChannelLiveLog,
        'cll',
        'cll.channelLiveId = cl.id',
      )
      .leftJoinAndSelect('cl.liveCategory', 'clc')
      .orderBy('c.openLive', 'DESC')
      .addOrderBy('cl.updatedAt', 'DESC')
      .addOrderBy('cll.createdAt', 'DESC')
      .where('c.uuid = :uuid', { uuid })
      .getOne();
  }

  async generateChannel(
    generateChannelDto: GenerateChannelDto,
  ): Promise<Channel> {
    const instance = this.repository.create({
      ...generateChannelDto,
    });

    return await this.repository.save(instance);
  }

  async modifyChannel(
    id: number,
    modifyChannelDto: GenerateChannelDto,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, modifyChannelDto);
  }

  async getRecentActivityById(channelId: number, openLive: boolean) {
    let query = `
    SELECT DISTINCT cll."liveTitle", c."channelName", clc."liveCategoryValue", round(avg(cll."concurrentUserCount"), 0) "averageViewers", min(cll."createdAt") "start", max(cll."createdAt") "end" FROM "channelLiveLog" cll 
    LEFT JOIN "channelLive" cl ON cl.id = cll."channelLiveId" 
    LEFT JOIN "channel" c ON c.id = cl."channelId"
    LEFT JOIN "channelLiveCategory" clc ON clc.id = cll."liveCategoryId"
    WHERE c.id = ${channelId} `;

    if (openLive) {
      query += `AND to_char(now(), 'YYYYMMDD') = to_char(cll."createdAt", 'YYYYMMDD')`;
    } else {
      query += `AND (to_char(now(), 'YYYYMMDD') = to_char(cll."createdAt", 'YYYYMMDD')`;
      query += `OR to_char(now() - '1 day'::INTERVAL, 'YYYYMMDD') = to_char(cll."createdAt", 'YYYYMMDD'))`;
    }

    query += `GROUP BY cll."liveTitle", c."channelName", clc."liveCategoryValue"`;
    query += `ORDER BY "start" DESC`;

    return await this.repository.query(query);
  }

  async getCalendarValueById(channelId: number) {
    const query = `
    SELECT to_char(cll."createdAt", 'YYYY-MM-DD') "day", round(EXTRACT(epoch FROM max(cll."createdAt")) - EXTRACT(epoch FROM min(cll."createdAt")),0) "value" FROM channel c
    JOIN "channelLive" cl ON cl."channelId" = c.id
    JOIN "channelLiveLog" cll ON cll."channelLiveId" = cl.id
    WHERE c.id = ${channelId}
    GROUP BY to_char(cll."createdAt", 'YYYY-MM-DD');
    `;

    return await this.repository.query(query);
  }

  async getLiveCategoryRankById(channelId: number) {
    const query = `
    SELECT clc."liveCategoryValue", count(*) FROM channel c
    JOIN "channelLive" cl on cl."channelId" = c.id
    JOIN "channelLiveLog" cll on cll."channelLiveId" = cl.id 
    JOIN "channelLiveCategory" clc ON clc.id = cll."liveCategoryId" 
    WHERE c.id = ${channelId}
    GROUP BY clc.id`;

    return await this.repository.query(query);
  }

  async findChannelsV2(findChannelDto: FindChannelDtoV2) {
    const {
      channelName,
      isChatCollected,
      openLive,
      uuid,
      nickname,
      userIdHash,
      sortBy,
      sortOrder,
    } = findChannelDto;
    const query = this.repository
      .createQueryBuilder('c')
      .leftJoinAndMapMany(
        'c.channelChatLogs',
        ChannelChatLog,
        'cll',
        'cll.channelId = c.id',
      );

    if (channelName) {
      query.andWhere('c.channelName ILIKE :channelName', {
        channelName: `%${channelName}%`,
      });
    }

    if (isChatCollected) {
      query.andWhere('c.isChatCollected = :isChatCollected', {
        isChatCollected,
      });
    }

    if (openLive) {
      query.andWhere('c.openLive = :openLive', { openLive });
    }

    if (uuid) {
      query.andWhere('c.uuid = :uuid', { uuid });
    }

    if (nickname) {
      query.andWhere('cll.nickname = :nickname', { nickname });
    }

    if (userIdHash) {
      query.andWhere('cll.userIdHash = :userIdHash', { userIdHash });
    }

    if (sortBy) {
      if (sortBy === ChannelSortField.FOLLOWER) {
        query.addOrderBy('c.follower', sortOrder ? sortOrder : 'DESC');
      } else if (sortBy === ChannelSortField.OPEN_LIVE) {
        query.addOrderBy('c.openLive', sortOrder ? sortOrder : 'DESC');
      } else if (sortBy === ChannelSortField.CHAT_CREATED_AT) {
        query.addOrderBy('cll.createdAt', sortOrder ? sortOrder : 'DESC');
      }
    }

    return await query.getMany();
  }
}
