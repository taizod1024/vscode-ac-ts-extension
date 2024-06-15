import { XExtension } from "./XExtension";
import { XLanguage } from "./XLanguage";

export interface XSite {
  // prop
  site: string;
  siteurl: string;
  contestregexp: RegExp;
  contestmessage: string;
  taskregexp: RegExp;
  taskmessage: string;
  xlanguages: XLanguage[];
  xextension: XExtension;
  contest: string;
  task: string;
  extension: string;
  language: string;

  // method
  checkLogin(): void;
  initPropAsync(withtask: boolean): Promise<void>;
  loginSiteAsync(): void;
  getTestAsync(): any;
  submitTaskAsync(): void;
  browseTask(): void;
  getLanguageId(): any;
  loadState(json: any): void;
  saveState(json: any): void;
  loadStateAsync(): Promise<void>;
  saveStateAsync(): Promise<void>;
  deleteStateAsync(): Promise<void>;
}
