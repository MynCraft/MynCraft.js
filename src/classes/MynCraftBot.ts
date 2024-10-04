import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { Client, ClientOptions, createClient } from "minecraft-protocol";
import Plugin from "./Plugin";
import { Logger } from "@myncraftjs/logger";
import { ClientEvents, Registry } from "../types/mpClient";
import prismarineRegistry from "prismarine-registry";
import version from "../utils/version";
import { IndexedData, Version } from "minecraft-data";
import plugins from "../plugins";

export type OnlyBotEvents = {
  error: (error: Error) => void;
};
export type BotEvents = OnlyBotEvents | ClientEvents;
export interface BotOptions extends ClientOptions {
  hideErrors?: boolean;
  plugins?: Array<Plugin>;
  mainHand?: "left" | "right";
  brand?: string;
}
export default class MynCarftBot extends (EventEmitter as new () => TypedEmitter<BotEvents>) {
  private _mpClient: Client;
  private options: BotOptions;
  private loadedPlugins: Plugin[] = [];
  registry: Registry;
  protocolVersion?: Version["version"];
  majorVersion: Version["majorVersion"];
  version: Version["minecraftVersion"];
  supportFeature?: IndexedData["supportFeature"];
  logger: Logger;
  constructor(options: BotOptions) {
    super();
    this.options = options;
    this._mpClient = createClient(options);
    this.logger = new Logger({ header: options.username });
    if (!options.hideErrors) {
      this._mpClient.on("error", (err) => {
        this.emit("error", err);
      });
      this.on("error", (e: any) => this.logger.error(e));
    }
    const serverPingVersion = this._mpClient.version;
    this.registry = prismarineRegistry(serverPingVersion);
    const next = () => {
      if (!this.registry?.version)
        throw new Error(
          `Server version '${serverPingVersion}' is not supported, no data for version`
        );
      const versionData = this.registry.version;
      if (versionData[">"](version.latestSupportedVersion)) {
        throw new Error(
          `Server version '${serverPingVersion}' is not supported. Latest supported version is '${version.latestSupportedVersion}'.`
        );
      } else if (versionData["<"](version.oldestSupportedVersion)) {
        throw new Error(
          `Server version '${serverPingVersion}' is not supported. Oldest supported version is '${version.oldestSupportedVersion}'.`
        );
      }
      this.protocolVersion = versionData.version;
      this.majorVersion = versionData.majorVersion;
      this.version = versionData.minecraftVersion;
      options.version = versionData.minecraftVersion;
      this.supportFeature = this.registry.supportFeature;
      this.loadPlugin(...plugins);
    };
    //@ts-ignore
    if (!this._mpClient.wait_connect) next();
    else this._mpClient.once("connect_allowed", next);
  }
  end(reason: string) {
    this._mpClient.end(reason);
  }
  loadPlugin(...plugins: Plugin[]) {
    for (const plugin of plugins) {
      if (
        !(plugin instanceof Plugin) &&
        this.loadedPlugins.indexOf(plugin) != 0
      )
        continue;
      plugin.function(this, this.options);
      this.loadedPlugins.push(plugin);
    }
  }
}
