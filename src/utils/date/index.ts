import dayjs from 'dayjs'

/**
 * 格式化 ISO 时间字符串
 * @param isoString ISO 8601 时间
 * @param formatStr 格式化模板，默认 'YYYY-MM-DD HH:mm'
 * @returns 格式化后的时间字符串
 */
export function formatTime(isoString: string, formatStr = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(isoString).format(formatStr)
}

/**
 * 根据开始时间和结束时间获取活动状态
 * @param startISO 活动开始时间 ISO 字符串
 * @param endISO 活动结束时间 ISO 字符串
 * @returns '未开始' | '进行中' | '已结束'
 */
export function getActivityStatus(startISO: string, endISO: string) {
  const now = dayjs()
  const start = dayjs(startISO)
  const end = dayjs(endISO)

  if (now.isBefore(start)) return '未开始'
  if (now.isAfter(end)) return '已结束'
  return '进行中'
}

/**
 * 同时返回格式化后的时间和状态
 * @param startISO 活动开始时间 ISO 字符串
 * @param endISO 活动结束时间 ISO 字符串
 */
export function getActivityTimeInfo(startISO: string, endISO: string) {
  return {
    startTime: formatTime(startISO),
    endTime: formatTime(endISO),
    status: getActivityStatus(startISO, endISO)
  }
}
