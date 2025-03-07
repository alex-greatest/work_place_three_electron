import log from 'electron-log';
import path from 'path';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc.js";
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc);
dayjs.extend(timezone);

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function runSettings() {
  log.transports.file.resolvePathFn = () => path.join("D:\\", 'logs/main.log');
  log.initialize();
}
