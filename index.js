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
  console.log('Bot WL ligado!');
});

const perguntasWL = [
  'Qual seu nome no jogo?',
  'Qual seu ID no jogo?',
  'Qual seu nome e idade?',
  'Quanto tempo joga FiveM?',
  'Já participou de alguma cidade RP? Qual?',
  'O que significa Amor à Vida no RP?',
  'Você está sozinho e 5 pessoas armadas anunciam assalto. O que você faz?',
  'O que é RDM?',
  'O que é VDM?',
  'É permitido atropelar alguém sem motivo RP?',
  'O que significa PowerGaming?',
  'Cite um exemplo de PowerGaming.',
  'O que é MetaGaming?',
  'Pode usar informações do Discord/live dentro do RP?',
  'O que é Combat Log?',
  'É permitido sair do jogo durante ação RP?',
  'Como deve funcionar uma abordagem RP?',
  'É permitido matar alguém sem desenvolvimento de RP?',
  'É permitido desrespeitar membros ou staff no Discord?',
  'O que deve fazer ao encontrar um bug na cidade?',
  'Um amigo seu quebra regra em ação RP. O que você faria?',
  'Por que devemos aprovar sua WL no Distrito 011 RP?'
];

const respostasWL = {};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!wl') {
    if (message.channel.name !== '📝・liberar-wl') {
      return message.reply('Use esse comando no canal 📝・liberar-wl');
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_wl')
        .setLabel('Iniciar WL')
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content:
        '📋 **WL OFICIAL — DISTRITO 011 RP**\n\n' +
        'Clique no botão abaixo para iniciar sua whitelist.\n\n' +
        '⏰ Você terá **5 minutos para responder cada pergunta**.',
      components: [row]
    });
  }

  if (respostasWL[message.author.id]) {
    const dados = respostasWL[message.author.id];

    clearTimeout(dados.timer);

    dados.respostas.push(message.content);
    dados.etapa++;

    if (dados.etapa >= perguntasWL.length) {
      const canalStaff = message.guild.channels.cache.find(
        c => c.name === '✅・verificação'
      );

      if (!canalStaff) {
        delete respostasWL[message.author.id];
        return message.reply('❌ Canal ✅・verificação não encontrado.');
      }

      let textoFinal = '';

      perguntasWL.forEach((pergunta, index) => {
        textoFinal += `**${index + 1}. ${pergunta}**\n${dados.respostas[index]}\n\n`;
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aprovar_${message.author.id}`)
          .setLabel('Aprovar')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`reprovar_${message.author.id}`)
          .setLabel('Reprovar')
          .setStyle(ButtonStyle.Danger)
      );

      await canalStaff.send({
        content:
          `📋 **NOVA WL RECEBIDA**\n\n` +
          `👤 Candidato: ${message.author}\n\n` +
          textoFinal,
        components: [row]
      });

      delete respostasWL[message.author.id];

      return message.reply('✅ Sua WL foi enviada para análise da staff.');
    }

    dados.timer = setTimeout(() => {
      if (respostasWL[message.author.id]) {
        delete respostasWL[message.author.id];

        message.channel.send(
          `${message.author} ❌ Sua WL foi cancelada por inatividade.`
        ).catch(() => {});
      }
    }, 300000);

    return message.reply(
      `📋 **Pergunta ${dados.etapa + 1}/${perguntasWL.length}**\n\n` +
      `${perguntasWL[dados.etapa]}\n\n` +
      `⏰ Você tem 5 minutos para responder.`
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'abrir_wl') {
    if (respostasWL[interaction.user.id]) {
      return interaction.reply({
        content: '⚠️ Você já está fazendo uma WL.',
        ephemeral: true
      });
    }

    respostasWL[interaction.user.id] = {
      etapa: 0,
      respostas: [],
      timer: null
    };

    respostasWL[interaction.user.id].timer = setTimeout(() => {
      if (respostasWL[interaction.user.id]) {
        delete respostasWL[interaction.user.id];

        interaction.followUp({
          content: '❌ Sua WL foi cancelada por inatividade.',
          ephemeral: true
        }).catch(() => {});
      }
    }, 300000);

    return interaction.reply({
      content:
        `📋 **Pergunta 1/${perguntasWL.length}**\n\n` +
        `${perguntasWL[0]}\n\n` +
        `⏰ Você tem 5 minutos para responder no canal.`,
      ephemeral: true
    });
  }

  if (interaction.customId.startsWith('aprovar_')) {
    const userId = interaction.customId.split('_')[1];
    const membro = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!membro) {
      return interaction.reply({
        content: '❌ Membro não encontrado.',
        ephemeral: true
      });
    }

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

    const canalResultado = interaction.guild.channels.cache.find(
      c => c.name === '✅・resultado-wl'
    );

    if (canalResultado) {
      await canalResultado.send(
        `✅ **WL APROVADA**\n\n` +
        `👤 Membro: ${membro}\n` +
        `📢 Staff: ${interaction.user}`
      );
    }

    return interaction.update({
      content:
        `✅ **WL APROVADA**\n\n` +
        `👤 Membro: ${membro}\n` +
        `📢 Aprovado por: ${interaction.user}`,
      components: []
    });
  }

  if (interaction.customId.startsWith('reprovar_')) {
    const userId = interaction.customId.split('_')[1];
    const membro = await interaction.guild.members.fetch(userId).catch(() => null);

    const canalResultado = interaction.guild.channels.cache.find(
      c => c.name === '✅・resultado-wl'
    );

    if (canalResultado) {
      await canalResultado.send(
        `❌ **WL REPROVADA**\n\n` +
        `👤 Membro: ${membro || 'Não encontrado'}\n` +
        `📢 Staff: ${interaction.user}`
      );
    }

    return interaction.update({
      content:
        `❌ **WL REPROVADA**\n\n` +
        `👤 Membro: ${membro || 'Não encontrado'}\n` +
        `📢 Reprovado por: ${interaction.user}`,
      components: []
    });
  }
});

client.login(process.env.TOKEN);

const app = express();

app.get('/', (req, res) => {
  res.send('Bot WL online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});