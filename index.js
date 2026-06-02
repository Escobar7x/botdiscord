const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  PermissionsBitField
} = require('discord.js');

const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('Bot WL ligado!');
});

// PAINEL WL
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!wl') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_wl')
        .setLabel('Iniciar WL')
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content:
        '📋 **WHITELIST - CIDADE RP**\n\n' +
        'Clique no botão abaixo para abrir seu canal privado de WL.\n\n' +
        '⚠️ Responda com atenção.\n' +
        '✅ A staff irá analisar.',
      components: [row]
    });
  }
});

// BOTÕES
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // ABRIR CANAL PRIVADO
  if (interaction.customId === 'abrir_wl') {
    const guild = interaction.guild;
    const user = interaction.user;

    const canalExistente = guild.channels.cache.find(
      c => c.name === `wl-${user.username.toLowerCase()}`
    );

    if (canalExistente) {
      return interaction.reply({
        content: `Você já tem uma WL aberta: ${canalExistente}`,
        ephemeral: true
      });
    }

    const canal = await guild.channels.create({
      name: `wl-${user.username}`,
      type: 0,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels
          ]
        }
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${user.id}`)
        .setLabel('Aprovar WL')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`reprovar_${user.id}`)
        .setLabel('Reprovar WL')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('fechar_wl')
        .setLabel('Fechar')
        .setStyle(ButtonStyle.Secondary)
    );

    await canal.send({
      content:
        `📋 **WHITELIST DE ${user}**\n\n` +
        `Responda copiando este modelo:\n\n` +
        `👤 Nome:\n` +
        `🆔 ID:\n\n` +
        `1. O que é amor à vida?\n` +
        `2. O que é RDM?\n` +
        `3. O que é VDM?\n` +
        `4. O que é PowerGaming?\n` +
        `5. O que é MetaGaming?\n` +
        `6. Como deve ser feita uma abordagem?\n` +
        `7. Explique uma regra de facção.\n` +
        `8. Explique uma regra de polícia.\n\n` +
        `⚠️ Após responder, aguarde a staff analisar.`,
      components: [row]
    });

    return interaction.reply({
      content: `✅ Canal de WL criado: ${canal}`,
      ephemeral: true
    });
  }

  // APROVAR
  if (interaction.customId.startsWith('aprovar_')) {
    const userId = interaction.customId.split('_')[1];
    const membro = await interaction.guild.members.fetch(userId);

    const mensagens = await interaction.channel.messages.fetch({ limit: 20 });
    const resposta = mensagens.find(m => m.author.id === userId);

    if (!resposta) {
      return interaction.reply({
        content: '❌ Não encontrei a resposta do candidato.',
        ephemeral: true
      });
    }

    const nomeMatch = resposta.content.match(/Nome:\s*(.+)/i);
    const idMatch = resposta.content.match(/ID:\s*(\d+)/i);

    if (!nomeMatch || !idMatch) {
      return interaction.reply({
        content: '❌ O candidato precisa preencher Nome e ID corretamente.',
        ephemeral: true
      });
    }

    const nome = nomeMatch[1].trim();
    const id = idMatch[1].trim();

    const cargoAprovado = interaction.guild.roles.cache.find(
      r => r.name === '✅ WL Aprovado'
    );

    const cargoVisitante = interaction.guild.roles.cache.find(
      r => r.name === 'visitante'
    );

    if (cargoAprovado) {
      await membro.roles.add(cargoAprovado).catch(() => {});
    }

    if (cargoVisitante) {
      await membro.roles.remove(cargoVisitante).catch(() => {});
    }

    await membro.setNickname(`${nome} | ${id}`).catch(() => {});

    await interaction.reply(
      `✅ **WL APROVADA**\n\n` +
      `👤 Membro: ${membro}\n` +
      `📋 Nome: ${nome}\n` +
      `🆔 ID: ${id}\n` +
      `📢 Aprovado por: ${interaction.user}`
    );
  }

  // REPROVAR
  if (interaction.customId.startsWith('reprovar_')) {
    const userId = interaction.customId.split('_')[1];
    const membro = await interaction.guild.members.fetch(userId);

    await interaction.reply(
      `❌ **WL REPROVADA**\n\n` +
      `👤 Membro: ${membro}\n` +
      `📢 Reprovado por: ${interaction.user}`
    );
  }

  // FECHAR
  if (interaction.customId === 'fechar_wl') {
    await interaction.reply('🔒 Canal será fechado em 5 segundos...');

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(process.env.TOKEN);

// RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('Bot WL online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});