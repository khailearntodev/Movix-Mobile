export enum ReportTargetType {
  BLOG = 'BLOG',
  COMMENT = 'COMMENT',
  USER = 'USER',
  WATCH_PARTY = 'WATCH_PARTY',
}

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}
