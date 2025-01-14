import { ActivityType } from "discord.js";
import { EventListener } from "../handlers/EventHandler.js";
import { success } from "../util/logger.js";

export default new EventListener({
  name: 'ready',
  async listener() {
    this.user.setStatus('idle');
    this.user.setPresence({
      status: "online",
      activities: [{
        name: `<${this.prefix}commandName>`,
        type: ActivityType.Watching,
      }],
    });
    success(this.user.displayName + " bot has started");
  }
})
