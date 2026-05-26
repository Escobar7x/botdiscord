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

    const texto =
      message.content.replace('!categoria ', '');

    const partes = texto.split('|');

    if (partes.length < 2) {
      return message.reply(
        'Use: !categoria BAEP | conduta,regras'
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
  // CRIAR CANAL COM MENSAGEM FIXADA
  // =========================================
  if (message.content.startsWith('!canalfixo ')) {

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

    const lista =
      message.content
        .replace('!cargos ', '')
        .split(',');

    for (const cargoNome of lista) {

      const nomeFormatado =
        cargoNome.trim();

      await message.guild.roles.create({
        name: nomeFormatado
      });

    }

    return message.reply(
      '✅ Todos os cargos foram criados.'
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