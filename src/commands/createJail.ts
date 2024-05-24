import { ApplicationCommandOptionType, ChannelType, OverwriteData, PermissionFlagsBits } from "discord.js";
import { Command } from "../handlers/commandHandler.js";

export default new Command({
  name: 'créer-prison',
  description: "Créer un canal textuel prison pour la commande d'emprisonnement",
  isSlash: true,
  guildOnly: true,
  permissions: ['ManageChannels', 'ManageRoles'],
  options: [{
    name: 'role-à-remplacer',
    description: 'le rôle à retirer qui donne accès au reste du serveur',
    required: true,
    type: ApplicationCommandOptionType.Role
    },{ 
    name: 'channel',
    required: false,
    type: ApplicationCommandOptionType.Channel,
    description: "le canal d'emprisonnement"
  }, {
    name: 'prisoner-role',
    description: 'le rôle qui va être attribuer à la personne qui va en prison',
    required: false,
    type: ApplicationCommandOptionType.Role,
  }],
  async handler(interaction) {
    const guilddb = await this.GuildManager.ensure(interaction.guildId)
    let role = interaction.options.getRole('prisoner-role')
    let channel = interaction.options.getChannel('channel')
    let toRemoveRole = interaction.options.getRole('role-à-remplacer', true)
    let cancelChannel = false
    let cancelRole = false

    if (!role) {
      role = await interaction.guild.roles.create({
        name: 'prisonnier',
      })
      cancelRole = true
    }
    role.permissions.remove('ViewChannel')
    const channelPermissions: OverwriteData[] = [{
      id: interaction.guildId,
      deny: [PermissionFlagsBits.ViewChannel],
    }, {
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
    }]

    if (!channel) {
      channel = await interaction.guild.channels.create({
        permissionOverwrites: channelPermissions,
        type: ChannelType.GuildText,
        name: 'prison'
      })
      cancelChannel = true
    } else {
      if (channel.type !== ChannelType.GuildText) {
        await interaction.reply({ content: "le canal choisi n'est pas un canal textuel"})
        return
      }

      let oldperms = channel.permissionOverwrites.cache.map(x => x)
      await channel.permissionOverwrites.set([...oldperms, ...channelPermissions])
    }

    await guilddb.updateGuild({
      jailId: channel.id,
      jailRoleId: role.id,
      toDeleteRoleId: toRemoveRole.id
    }).then(async() => {
      await interaction.reply({ ephemeral: true, content: 'La prison a été crée avec succès'})
    }).catch(async() => {
      if (cancelChannel) {
        await channel.delete()
      }

      if (cancelRole) {
        await role.delete()
      }
      await interaction.reply({ ephemeral: true, content: 'Une erreur est survenue durant l'})
    })
  }
})