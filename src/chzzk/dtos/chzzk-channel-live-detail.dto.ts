export class ChzzkChannelDetailDto {
  liveId: number;
  liveTitle: string;
  status: string;
  liveImageUrl: string;
  defaultThumbnailImageUrl: string | null;
  concurrentUserCount: number;
  accumulateCount: number;
  openDate: string;
  closeDate: string | null;
  adult: boolean;
  chatChannelId: string;
  categoryType: string;
  liveCategory: string;
  liveCategoryValue: string;
  chatActive: boolean;
  chatAvailableGroup: string;
  paidPromotion: boolean;
  chatAvailableCondition: string;
  minFollowerMinute: number;
  livePlaybackJson: string;
  channel: {
    channelId: string;
    channelName: string;
    channelImageUrl: string;
    verifiedMark: boolean;
  };
  livePollingStatusJson: string;
  userAdultStatus: null | string;
  chatDonationRankingExposure: boolean;
  livePlayback: {
    meta: {
      videoId: string;
      streamSeq: number;
      liveId: string;
      paidLive: boolean;
      cdnInfo: any[];
      p2p: boolean;
      cmcdEnabled: boolean;
      playbackAuthType: string;
    };
    serviceMeta: {
      contentType: string;
    };
    live: {
      start: string;
      open: string;
      timeMachine: boolean;
      status: string;
    };
    api: any[];
    media: any[];
    thumbnail: {
      snapshotThumbnailTemplate: string;
      spriteSeekingThumbnail: any;
      types: any[];
    };
  };
}
