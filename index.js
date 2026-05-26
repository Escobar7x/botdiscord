const {
  Client,
  GatewayIntentBits
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

  // =========================================
  // CRIAR CATEGORIA COM CANAIS
  // =========================================
  if (message.content.startsWith('!categoria ')) {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply(
        '❌ Você precisa ser administrador.'
      );
    }

    const texto =
      message.content.replace('!categoria ', '');

    const partes = texto.split('|');

    if (partes.length < 2) {
      return message.reply(
        'Use: !categoria BAEP | regras,avisos'
      );
    }

    const nomeCategoria = partes[0].trim();

    const canais = partes[1].split(',');

    // CRIAR CATEGORIA
    const categoria =
      await message.guild.channels.create({
        name: nomeCategoria,
        type: 4
      });

    // CRIAR CANAIS
    for (const canalNome of canais) {

      const nomeFormatado =
        canalNome
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

      await message.guild.channels.create({
        name: nomeFormatado,
        type: 0,
        parent: categoria.id
      });

    }

    return message.reply(
      `✅ Categoria "${nomeCategoria}" criada.`
    );

  }

  // =========================================
  // CRIAR CANAL
  // =========================================
  if (message.content.startsWith('!canal ')) {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply(
        '❌ Você precisa ser administrador.'
      );
    }

    const nomeCanal =
      message.content
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

  // =========================================
  // CRIAR CANAL FIXADO
  // =========================================
  if (message.content.startsWith('!canalfixo ')) {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply(
        '❌ Você precisa ser administrador.'
      );
    }

    const texto =
      message.content.replace('!canalfixo ', '');

    const partes = texto.split('|');

    const nomeCanal =
      partes[0]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    const mensagemFixada = partes[1];

    if (!mensagemFixada) {
      return message.reply(
        'Use: !canalfixo regras | mensagem'
      );
    }

    const canal =
      await message.guild.channels.create({
        name: nomeCanal,
        type: 0
      });

    const msg =
      await canal.send(
        mensagemFixada.trim()
      );

    await msg.pin();

    return message.reply(
      `✅ Canal criado e mensagem fixada em #${nomeCanal}`
    );

  }

  // =========================================
  // CRIAR CARGOS
  // =========================================
  if (message.content.startsWith('!cargos ')) {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply(
        '❌ Você precisa ser administrador.'
      );
    }

    const lista =
      message.content
        .replace('!cargos ', '')
        .split(',');

    let criados = [];

    for (const cargoNome of lista) {

      const nomeFormatado =
        cargoNome.trim();

      // IGNORAR VAZIO
      if (!nomeFormatado) continue;

      // VERIFICAR SE JÁ EXISTE
      const existe =
        message.guild.roles.cache.find(
          r => r.name === nomeFormatado
        );

      if (existe) continue;

      // CRIAR CARGO
      await message.guild.roles.create({
        name: nomeFormatado
      });

      criados.push(nomeFormatado);

    }

    return message.reply(
      `✅ ${criados.length} cargos criados.`
    );

  }

});

client.login(process.env.TOKEN);

// =========================================
// RENDER
// =========================================
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(
  process.env.PORT || 3000,
  () => {
    console.log('Servidor web iniciado');
  }
);