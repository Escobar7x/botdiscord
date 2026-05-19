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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith('!')) return;

  if (
    message.content.toLowerCase().includes('nome') &&
    message.content.toLowerCase().includes('id')
  ) {
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`Soldado_${message.author.id}`).setLabel('Soldado').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`Cabo_${message.author.id}`).setLabel('Cabo').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`Sargento_${message.author.id}`).setLabel('Sargento').setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`Tenente_${message.author.id}`).setLabel('Tenente').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`Capitao_${message.author.id}`).setLabel('Capitão').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`Major_${message.author.id}`).setLabel('Major').setStyle(ButtonStyle.Success)
    );

    await message.reply({
      content: '📋 Escolha a patente do membro:',
      components: [row1, row2]
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const [patente, userId] = interaction.customId.split('_');
  const membro = await interaction.guild.members.fetch(userId);

  const historico = await interaction.channel.messages.fetch({ limit: 10 });
  const msgUsuario = historico.find(m => m.author.id === userId);

  if (!msgUsuario) {
    return interaction.reply({ content: 'Mensagem do usuário não encontrada.', ephemeral: true });
  }

  const conteudo = msgUsuario.content;

  const nomeMatch = conteudo.match(/Nome:\s*(.+)/i);
  const idMatch = conteudo.match(/ID:\s*(\d+)/i);

  if (!nomeMatch || !idMatch) {
    return interaction.reply({
      content: 'Formato inválido. Use:\nNome: João Pedro\nID: 5778',
      ephemeral: true
    });
  }

  const nome = nomeMatch[1].trim();
  const id = idMatch[1].trim();

  const tags = {
    Soldado: 'SD',
    Cabo: 'CB',
    Sargento: 'SGT',
    Tenente: 'TEN',
    Capitao: 'CAP',
    Major: 'MAJ'
  };

  const cargoNome = patente === 'Capitao' ? 'Capitão' : patente;
  const cargo = interaction.guild.roles.cache.find(r => r.name === cargoNome);

  if (!cargo) {
    return interaction.reply({ content: `Cargo "${cargoNome}" não encontrado.`, ephemeral: true });
  }

  await membro.roles.add(cargo);
  await membro.setNickname(`[${tags[patente]}] ${nome} | ${id}`);

  await interaction.reply({
    content:
      `✅ SET APLICADO\n\n` +
      `👤 ${membro}\n` +
      `📋 Patente: ${cargoNome}\n` +
      `🆔 ${id}\n` +
      `📢 Responsável: ${interaction.user}`,
    ephemeral: false
  });
});

client.login(process.env.TOKEN);

const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});