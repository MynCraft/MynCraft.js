import MynCarftBot, { BotOptions } from "./MynCraftBot";
export interface PluginOptions {
  name?: string;
  function: (bot: MynCarftBot, options: BotOptions) => void;
}
export default class Plugin {
  function: (bot: MynCarftBot, options: BotOptions) => void;
  name: string;
  constructor(options: PluginOptions) {
    this.function = options.function;
    this.name = options.name ?? "no-named";
  }
}
