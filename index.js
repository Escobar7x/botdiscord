const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
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
  console.log('Bot ligado!');
});

// MENSAGENS
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  // CRIAR CANAL
  if (message.content.startsWith('!canal ')) {

    const nomeCanal = message.content
      .replace('!canal ', '')
      .toLowerCase()
      .replace(/\s+/g, '-');

    await message.guild.channels.create({
      name: nomeCanal,
      type: 0
    });

    return message.reply(
      `✅ Canal criado: #${nomeCanal}`
    );
  }

  // IGNORA OUTROS COMANDOS
  if (message.content.startsWith('!')) return;

  // SISTEMA DE SET
  if (
    message.content.toLowerCase().includes('nome') &&
    message.content.toLowerCase().includes('id')
  ) {

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`Soldado_${message.author.id}`)
          .setLabel('Soldado')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`Cabo_${message.author.id}`)
          .setLabel('Cabo')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`Sargento_${message.author.id}`)
          .setLabel('Sargento')
          .setStyle(ButtonStyle.Success)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`Tenente_${message.author.id}`)
          .setLabel('Tenente')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`Capitao_${message.author.id}`)
          .setLabel('Capitão')
          .setStyle(ButtonStyle.Danger)
      );

    await message.reply({
      content: '📋 Escolha a patente do membro:',
      components: [row1, row2]
    });
  }

});

// BOTÕES
client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.isButton()) return;

  const [patente, userId] = interaction.customId.split('_');

  const membro = await interaction.guild.members.fetch(userId);

  const historico = await interaction.channel.messages.fetch({
    limit: 10
  });

  const msgUsuario = historico.find(
    m => m.author.id === userId
  );

  if (!msgUsuario) {
    return interaction.reply({
      content: 'Mensagem do usuário não encontrada.',
      ephemeral: true
    });
  }

  const conteudo = msgUsuario.content;

  const nomeMatch = conteudo.match(/Nome:\s*(.+)/i);
  const idMatch = conteudo.match(/ID:\s*(\d+)/i);

  if (!nomeMatch || !idMatch) {
    return interaction.reply({
      content:
        'Formato inválido.\n\nUse:\nNome: João Pedro\nID: 5778',
      ephemeral: true
    });
  }

  const nome = nomeMatch[1].trim();
  const id = idMatch[1].trim();

  // TAGS
  const tags = {
    Soldado: 'SD',
    Cabo: 'CB',
    Sargento: 'SGT',
    Tenente: 'TEN',
    Capitao: 'CAP'
  };

  // CARGOS
  const cargos = {
    Soldado: '👮 Soldado',
    Cabo: '👮 Cabo',
    Sargento: '👮 Sargento III',
    Tenente: '👮 Tenente',
    Capitao: '👮 Capitão'
  };

  const cargoNome = cargos[patente];

  // CARGO BAEP
  const cargoBaep = interaction.guild.roles.cache.find(
    r => r.name === 'BAEP'
  );

  // CARGO PATENTE
  const cargo = interaction.guild.roles.cache.find(
    r => r.name === cargoNome
  );

  if (!cargo) {
    return interaction.reply({
      content: `Cargo "${cargoNome}" não encontrado.`,
      ephemeral: true
    });
  }

  // DAR CARGO
  await membro.roles.add(cargo);

  // DAR BAEP
  if (cargoBaep) {
    await membro.roles.add(cargoBaep);
  }

  // ALTERAR NICK
  await membro.setNickname(
    `[${tags[patente]}] ${nome} | ${id}`
  );

  // RESPOSTA
  await interaction.reply({
    content:
      `✅ SET APLICADO\n\n` +
      `👤 ${membro}\n` +
      `📋 Patente: ${cargoNome}\n` +
      `🆔 ID: ${id}\n` +
      `📢 Responsável: ${interaction.user}`,
    ephemeral: false
  });

});

client.login(process.env.TOKEN);

// RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});