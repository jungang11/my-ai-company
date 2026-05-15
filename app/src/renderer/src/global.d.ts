import type { PayrollOSAPI } from '../../preload/index';

declare global {
  interface Window {
    api: PayrollOSAPI;
  }
}

export {};
