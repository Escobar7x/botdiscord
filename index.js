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
  '1. Qual seu nome e idade?',
  '2. Quanto tempo joga FiveM?',
  '3. Já participou de alguma cidade RP? Qual?',
  '4. O que significa Amor à Vida no RP?',
  '5. Você está sozinho e 5 pessoas armadas anunciam assalto. O que você faz?',
  '6. O que é RDM?',
  '7. O que é VDM?',
  '8. É permitido atropelar alguém sem motivo RP?',
  '9. O que significa PowerGaming?',
  '10. Cite um exemplo de PowerGaming.',
  '11. O que é MetaGaming?',
  '12. Pode usar informações do Discord/live dentro do RP?',
  '13. O que é Combat Log?',
  '14. É permitido sair do jogo durante ação RP?',
  '15. Como deve funcionar uma abordagem RP?',
  '16. É permitido matar alguém sem desenvolvimento de RP?',
  '17. É permitido desrespeitar membros ou staff no Discord?',
  '18. O que deve fazer ao encontrar um bug na cidade?',
  '19. Um amigo seu quebra regra em ação RP. O que você faria?',
  '20. Por que devemos aprovar sua WL no Distrito 011 RP?'
];

const respostasWL = {};

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
        '📋 **WL OFICIAL — DISTRITO 011 RP**\n\n' +
        'Clique no botão abaixo para iniciar sua whitelist.\n\n' +
        '⏰ Você terá **5 minutos por pergunta**.\n' +
        '⚠️ Responda com atenção.',
      components: [row]
    });
  }

  if (respostasWL[message.author.id]) {
    const dados = respostasWL[message.author.id];

    clearTimeout(dados.timer);

    dados.respostas.push(message.content);
    dados.etapa++;

    if (dados.etapa >= perguntasWL.length) {
      const canalAnalise = message.guild.channels.cache.find(
        c => c.name === '✅・verificação'
      );

      if (!canalAnalise) {
        delete respostasWL[message.author.id];
        return message.reply('❌ Canal ✅・verificação não encontrado.');
      }

      let textoFinal = '';

      perguntasWL.forEach((pergunta, index) => {
        textoFinal += `**${pergunta}**\n${dados.respostas[index]}\n\n`;
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

      await canalAnalise.send({
        content:
          `📋 **NOVA WL RECEBIDA**\n\n` +
          `👤 Candidato: ${message.author}\n\n` +
          textoFinal,
        components: [row]
      });

      delete respostasWL[message.author.id];

      return message.reply('✅ Sua WL foi enviada para análise da staff.');
    }

    dados.timer = setTimeout(async () => {
      if (respostasWL[message.author.id]) {
        delete respostasWL[message.author.id];
        message.channel.send(
          `${message.author} ❌ Sua WL foi cancelada por inatividade.`
        ).catch(() => {});
      }
    }, 300000);

    return message.reply(
      `⏰ Você tem 5 minutos para responder:\n\n${perguntasWL[dados.etapa]}`
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

    respostasWL[interaction.user.id].timer = setTimeout(async () => {
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
        `📋 WL INICIADA\n\n` +
        `⏰ Você tem 5 minutos para responder cada pergunta.\n\n` +
        `${perguntasWL[0]}`,
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

// RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('Bot WL online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});