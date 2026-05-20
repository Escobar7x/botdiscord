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

const hierarquia = [
  '👮 Soldado',
  '👮 Cabo',
  '👮 Sargento III',
  '👮 Sargento II',
  '👮 Sargento I',
  '👮 Tenente',
  '👮 Capitão',
  '👮 Major',
  '👮 Coronel'
];

const tags = {
  '👮 Soldado': 'SD',
  '👮 Cabo': 'CB',
  '👮 Sargento III': 'SGT3',
  '👮 Sargento II': 'SGT2',
  '👮 Sargento I': 'SGT1',
  '👮 Tenente': 'TEN',
  '👮 Capitão': 'CAP',
  '👮 Major': 'MAJ',
  '👮 Coronel': 'CEL'
};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!promover ')) {
    const membro = message.mentions.members.first();
    const novoCargo = message.mentions.roles.first();

    if (!membro || !novoCargo) {
      return message.reply('Use: !promover @membro @cargo_novo');
    }

    const cargoAtual = membro.roles.cache.find(role =>
      hierarquia.includes(role.name)
    );

    if (cargoAtual) await membro.roles.remove(cargoAtual).catch(() => {});
    await membro.roles.add(novoCargo).catch(() => {});

    const nickAtual = membro.nickname || membro.user.username;
    const nomeSemTag = nickAtual.replace(/\[.*?\]/g, '').split('|')[0].trim();
    const idMatch = nickAtual.match(/\|\s*(\d+)/);
    const id = idMatch ? idMatch[1] : '0000';
    const novaTag = tags[novoCargo.name] || 'PM';

    await membro.setNickname(`[${novaTag}] ${nomeSemTag} | ${id}`).catch(() => {});

    const canal = message.guild.channels.cache.find(c => c.name === '📈・promoções');
    if (!canal) return message.reply('Canal 📈・promoções não encontrado.');

    return canal.send(
      `📈 PROMOÇÃO\n\n` +
      `Policial: ${membro}\n` +
      `Cargo Antigo: ${cargoAtual || 'Nenhum'}\n` +
      `Novo Cargo: ${novoCargo}\n` +
      `Responsável: ${message.author}\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')}`
    );
  }

  if (message.content.startsWith('!rebaixar ')) {
    const membro = message.mentions.members.first();
    const novoCargo = message.mentions.roles.first();

    if (!membro || !novoCargo) {
      return message.reply('Use: !rebaixar @membro @cargo_novo');
    }

    const cargoAtual = membro.roles.cache.find(role =>
      hierarquia.includes(role.name)
    );

    if (cargoAtual) await membro.roles.remove(cargoAtual).catch(() => {});
    await membro.roles.add(novoCargo).catch(() => {});

    const nickAtual = membro.nickname || membro.user.username;
    const nomeSemTag = nickAtual.replace(/\[.*?\]/g, '').split('|')[0].trim();
    const idMatch = nickAtual.match(/\|\s*(\d+)/);
    const id = idMatch ? idMatch[1] : '0000';
    const novaTag = tags[novoCargo.name] || 'PM';

    await membro.setNickname(`[${novaTag}] ${nomeSemTag} | ${id}`).catch(() => {});

    const canal = message.guild.channels.cache.find(c => c.name === '🔻・rebaixamentos');
    if (!canal) return message.reply('Canal 🔻・rebaixamentos não encontrado.');

    return canal.send(
      `🔻 REBAIXAMENTO\n\n` +
      `Policial: ${membro}\n` +
      `Cargo Antigo: ${cargoAtual || 'Nenhum'}\n` +
      `Novo Cargo: ${novoCargo}\n` +
      `Responsável: ${message.author}\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')}`
    );
  }

  if (message.content.startsWith('!categoria ')) {
    const texto = message.content.replace('!categoria ', '');
    const partes = texto.split('|');

    if (partes.length < 2) {
      return message.reply('Use: !categoria BAEP | conduta,regras,avisos');
    }

    const nomeCategoria = partes[0].trim();
    const canais = partes[1].split(',');

    const categoria = await message.guild.channels.create({
      name: nomeCategoria,
      type: 4
    });

    for (const canalNome of canais) {
      const nomeFormatado = canalNome.trim().toLowerCase().replace(/\s+/g, '-');

      await message.guild.channels.create({
        name: nomeFormatado,
        type: 0,
        parent: categoria.id
      });
    }

    return message.reply(`✅ Categoria "${nomeCategoria}" criada.`);
  }

  if (message.content.startsWith('!canal ')) {
    const nomeCanal = message.content
      .replace('!canal ', '')
      .toLowerCase()
      .replace(/\s+/g, '-');

    await message.guild.channels.create({
      name: nomeCanal,
      type: 0
    });

    return message.reply(`✅ Canal criado: #${nomeCanal}`);
  }

  if (message.content.startsWith('!canalfixo ')) {
    const texto = message.content.replace('!canalfixo ', '');
    const partes = texto.split('|');

    const nomeCanal = partes[0].trim().toLowerCase().replace(/\s+/g, '-');
    const mensagemFixada = partes[1];

    if (!mensagemFixada) {
      return message.reply('Use: !canalfixo regras | mensagem');
    }

    const canal = await message.guild.channels.create({
      name: nomeCanal,
      type: 0
    });

    const msg = await canal.send(mensagemFixada.trim());
    await msg.pin();

    return message.reply(`✅ Canal criado e mensagem fixada em #${nomeCanal}`);
  }

  if (message.content.startsWith('!')) return;

  if (
    message.content.toLowerCase().includes('nome') &&
    message.content.toLowerCase().includes('id')
  ) {
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`Soldado_${message.author.id}`).setLabel('Soldado').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`Cabo_${message.author.id}`).setLabel('Cabo').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`SargentoIII_${message.author.id}`).setLabel('Sargento III').setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`SargentoII_${message.author.id}`).setLabel('Sargento II').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`SargentoI_${message.author.id}`).setLabel('Sargento I').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`Tenente_${message.author.id}`).setLabel('Tenente').setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`Capitao_${message.author.id}`).setLabel('Capitão').setStyle(ButtonStyle.Danger)
    );

    await message.reply({
      content: '📋 Escolha a patente do membro:',
      components: [row1, row2, row3]
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const cargosPermitidos = [
    '👮 Tenente',
    '👮 Capitão',
    '👮 Major',
    '👮 Coronel'
  ];

  const podeSetar = interaction.member.roles.cache.some(role =>
    cargosPermitidos.includes(role.name)
  );

  if (!podeSetar) {
    return interaction.reply({
      content: '❌ Você não tem permissão para setar membros.',
      ephemeral: true
    });
  }

  const [patente, userId] = interaction.customId.split('_');
  const membro = await interaction.guild.members.fetch(userId);

  const historico = await interaction.channel.messages.fetch({ limit: 10 });
  const msgUsuario = historico.find(m => m.author.id === userId);

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
      content: 'Formato inválido.\n\nUse:\nNome: João Pedro\nID: 5778',
      ephemeral: true
    });
  }

  const nome = nomeMatch[1].trim();
  const id = idMatch[1].trim();

  const cargos = {
    Soldado: '👮 Soldado',
    Cabo: '👮 Cabo',
    SargentoIII: '👮 Sargento III',
    SargentoII: '👮 Sargento II',
    SargentoI: '👮 Sargento I',
    Tenente: '👮 Tenente',
    Capitao: '👮 Capitão'
  };

  const cargoNome = cargos[patente];
  const cargo = interaction.guild.roles.cache.find(r => r.name === cargoNome);
  const cargoVisitante = interaction.guild.roles.cache.find(r => r.name === '👤 Visitante');

  if (!cargo) {
    return interaction.reply({
      content: `Cargo "${cargoNome}" não encontrado.`,
      ephemeral: true
    });
  }

  await membro.roles.add(cargo);

  if (cargoVisitante) {
    await membro.roles.remove(cargoVisitante).catch(() => {});
  }

  const novaTag = tags[cargoNome] || 'PM';
  await membro.setNickname(`[${novaTag}] ${nome} | ${id}`).catch(() => {});

  await interaction.message.delete().catch(() => {});

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

const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});