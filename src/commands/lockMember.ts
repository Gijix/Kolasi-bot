import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../handlers/commandHandler.js";

export default new Command({
  name: 'lock',
  description: 'met en prison un membre',
  permissions: ['ManageRoles'],
  guildOnly: true,
  options: [
    {
      name: 'member',
      description: "le membre a mettre en prison",
      type: ApplicationCommandOptionType.User,
      required: true,
    }
  ],
  isSlash: true,
  async handler (interaction) {
    const user = interaction.options.getUser('member', true)
    const member = interaction.guild.members.cache.get(user.id)
    if (!member) {
      return await interaction.reply({ ephemeral: true, content: `l'utilisateur ${user.id} n'est plus dans la guild`})
    }

    const guildDb = await this.GuildManager.ensure(interaction.guildId)
    let jailOptions = guildDb.jailOptions

    const hasAlloptions = <S extends typeof jailOptions>(data: S): data is Required<S> => {
      for (let key in jailOptions) {
        if (!jailOptions[key as keyof typeof jailOptions]) {
          return false
        }
      }

      return true
    }

    if (!hasAlloptions(jailOptions)) {
      return await interaction.reply({ ephemeral: true, content: `vous n'avez pas crée de prison`})
    } 
    
    const role = interaction.guild.roles.cache.get(jailOptions.jailRoleId!)
    const toRemoveRole = interaction.guild.roles.cache.get(jailOptions.toDeleteRoleId!)
    const channel = interaction.guild.channels.cache.get(jailOptions.jailId!)

    if (!role) {
      return await interaction.reply({ ephemeral: true, content: `le role de prisonnier ${jailOptions.jailRoleId} n'existe plus`})
    }

    if (!toRemoveRole) {
      return await interaction.reply({ ephemeral: true, content: `le role de base ${jailOptions.jailRoleId} n'existe plus`})
    }

    if (!channel) {
      return await interaction.reply({ ephemeral: true, content: `le canal ${jailOptions.jailId} n'existe plus`})
    }

    await member.roles.add(role)
    await member.roles.remove(toRemoveRole)

    await interaction.reply({ ephemeral: true, content: "membre emprisonné avec succès"})
  }
})