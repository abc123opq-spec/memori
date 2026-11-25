import { IAffiliateData } from "../types";

// personal-fork: no server to send logs to
export function LogUtils_log(
  _user: string,
  _action: string,
  _affiliates: Partial<Record<string, IAffiliateData>>,
  _subscriptions: string[],
  _referrer?: string,
  _landingPage?: string,
  _detail?: string
): void {
  return;
}
