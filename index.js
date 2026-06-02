const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
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
  '1. Qual seu nome no jogo?',
  '2. Qual seu ID no jogo?',
  '3. Qual sua idade?',
  '4. Quanto tempo joga FiveM?',
  '5. Já participou de alguma cidade RP? Qual?',
  '6. O que significa Amor à Vida no RP?',
  '7. Você está sozinho e 5 pessoas armadas anunciam assalto. O que você faz?',
  '8. O que é RDM?',
  '9. O que é VDM?',
  '10. É permitido atropelar alguém sem motivo RP?',
  '11. O que significa PowerGaming?',
  '12. Cite um exemplo de PowerGaming.',
  '13. O que é MetaGaming?',
  '14. Pode usar informações do Discord/live dentro do RP?',
  '15. O que é Combat Log?',
  '16. É permitido sair do jogo durante ação RP?',
  '17. Como deve funcionar uma abordagem RP?',
  '18. É permitido matar alguém sem desenvolvimento de RP?',
  '19. O que deve fazer ao encontrar um bug na cidade?',
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
        '✅ Será aberto um ticket privado.\n' +
        '⏰ Você terá 5 minutos por pergunta.',
      components: [row]
    });
  }

  const dados = respostasWL[message.author.id];

  if (dados && message.channel.id === dados.canalId) {
    clearTimeout(dados.timer);

    dados.respostas.push(message.content);
    dados.etapa++;

    if (dados.etapa >= perguntasWL.length) {
      const canalStaff = message.guild.channels.cache.find(c => c.name === '✅・verificação');

      if (!canalStaff) {
        delete respostasWL[message.author.id];
        return message.reply('❌ Canal ✅・verificação não encontrado.');
      }

      let textoFinal = '';

      perguntasWL.forEach((pergunta, index) => {
        textoFinal += `**${pergunta}**\n${dados.respostas[index]}\n\n`;
      });

      const nomeJogo = dados.respostas[0];
      const idJogo = dados.respostas[1];

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aprovar_${message.author.id}_${message.channel.id}`)
          .setLabel('Aprovar')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`reprovar_${message.author.id}_${message.channel.id}`)
          .setLabel('Reprovar')
          .setStyle(ButtonStyle.Danger)
      );

      await canalStaff.send({
        content:
          `📋 **NOVA WL RECEBIDA**\n\n` +
          `👤 Candidato: ${message.author}\n` +
          `📛 Nome: ${nomeJogo}\n` +
          `🆔 ID: ${idJogo}\n\n` +
          textoFinal,
        components: [row]
      });

      delete respostasWL[message.author.id];

      return message.reply('✅ Sua WL foi enviada para análise da staff.');
    }

    dados.timer = setTimeout(() => {
      if (respostasWL[message.author.id]) {
        delete respostasWL[message.author.id];

        message.channel.send(`${message.author} ❌ Sua WL foi cancelada por inatividade.`).catch(() => {});

        setTimeout(() => {
          message.channel.delete().catch(() => {});
        }, 5000);
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
  if (interaction.isButton()) {
    if (interaction.customId === 'abrir_wl') {
      if (respostasWL[interaction.user.id]) {
        return interaction.reply({
          content: '⚠️ Você já está fazendo uma WL.',
          ephemeral: true
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `wl-${interaction.user.username}`,
        type: 0,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      respostasWL[interaction.user.id] = {
        etapa: 0,
        respostas: [],
        canalId: canal.id,
        timer: null
      };

      respostasWL[interaction.user.id].timer = setTimeout(() => {
        if (respostasWL[interaction.user.id]) {
          delete respostasWL[interaction.user.id];

          canal.send(`<@${interaction.user.id}> ❌ Sua WL foi cancelada por inatividade.`).catch(() => {});

          setTimeout(() => {
            canal.delete().catch(() => {});
          }, 5000);
        }
      }, 300000);

      await canal.send(
        `📋 **WL INICIADA**\n\n` +
        `Olá <@${interaction.user.id}>.\n\n` +
        `Responda uma pergunta por vez.\n` +
        `⏰ Você tem 5 minutos por pergunta.\n\n` +
        `📋 **Pergunta 1/${perguntasWL.length}**\n\n` +
        `${perguntasWL[0]}`
      );

      return interaction.reply({
        content: `✅ Seu ticket de WL foi criado: ${canal}`,
        ephemeral: true
      });
    }

    if (interaction.customId.startsWith('aprovar_')) {
      const partes = interaction.customId.split('_');
      const userId = partes[1];
      const canalId = partes[2];

      const membro = await interaction.guild.members.fetch(userId).catch(() => null);

      if (!membro) {
        return interaction.reply({
          content: '❌ Membro não encontrado.',
          ephemeral: true
        });
      }

      const nomeMatch = interaction.message.content.match(/📛 Nome:\s*(.+)/);
      const idMatch = interaction.message.content.match(/🆔 ID:\s*(.+)/);

      const nomeJogo = nomeMatch ? nomeMatch[1].trim() : membro.user.username;
      const idJogo = idMatch ? idMatch[1].trim() : '0000';

      const cargoMorador =
        interaction.guild.roles.cache.find(r => r.name === '👤 Morador') ||
        interaction.guild.roles.cache.find(r => r.name === 'Morador');

      const cargoVisitante =
        interaction.guild.roles.cache.find(r => r.name === 'visitante') ||
        interaction.guild.roles.cache.find(r => r.name === '👋 Visitante');

      if (cargoMorador) {
        await membro.roles.add(cargoMorador).catch(() => {});
      }

      if (cargoVisitante) {
        await membro.roles.remove(cargoVisitante).catch(() => {});
      }

      await membro.setNickname(`${nomeJogo} | ${idJogo}`).catch(() => {});

      const canalResultado = interaction.guild.channels.cache.find(c => c.name === '✅・resultado-wl');

      if (canalResultado) {
        await canalResultado.send(
          `✅ **WL APROVADA**\n\n` +
          `👤 Membro: ${membro}\n` +
          `📛 Nome: ${nomeJogo}\n` +
          `🆔 ID: ${idJogo}\n` +
          `📢 Staff: ${interaction.user}`
        );
      }

      const canalTicket = interaction.guild.channels.cache.get(canalId);
      if (canalTicket) {
        await canalTicket.send('✅ Sua WL foi aprovada! O ticket será fechado em 10 segundos.');
        setTimeout(() => canalTicket.delete().catch(() => {}), 10000);
      }

      return interaction.update({
        content:
          `✅ **WL APROVADA**\n\n` +
          `👤 Membro: ${membro}\n` +
          `📛 Nome: ${nomeJogo}\n` +
          `🆔 ID: ${idJogo}\n` +
          `📢 Aprovado por: ${interaction.user}`,
        components: []
      });
    }

    if (interaction.customId.startsWith('reprovar_')) {
      const modal = new ModalBuilder()
        .setCustomId(`motivo_reprovar_${interaction.customId}`)
        .setTitle('Motivo da reprovação');

      const motivo = new TextInputBuilder()
        .setCustomId('motivo')
        .setLabel('Por que a WL foi reprovada?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(motivo)
      );

      return interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('motivo_reprovar_')) {
      const motivo = interaction.fields.getTextInputValue('motivo');

      const customOriginal = interaction.customId.replace('motivo_reprovar_', '');
      const partes = customOriginal.split('_');

      const userId = partes[1];
      const canalId = partes[2];

      const membro = await interaction.guild.members.fetch(userId).catch(() => null);

      const canalResultado = interaction.guild.channels.cache.find(c => c.name === '✅・resultado-wl');

      if (canalResultado) {
        await canalResultado.send(
          `❌ **WL REPROVADA**\n\n` +
          `👤 Membro: ${membro || 'Não encontrado'}\n` +
          `📢 Staff: ${interaction.user}\n` +
          `📝 Motivo: ${motivo}`
        );
      }

      const canalTicket = interaction.guild.channels.cache.get(canalId);
      if (canalTicket) {
        await canalTicket.send(
          `❌ Sua WL foi reprovada.\n\n` +
          `📝 Motivo: ${motivo}\n\n` +
          `O ticket será fechado em 10 segundos.`
        );

        setTimeout(() => canalTicket.delete().catch(() => {}), 10000);
      }

      return interaction.reply({
        content:
          `❌ **WL REPROVADA**\n\n` +
          `👤 Membro: ${membro || 'Não encontrado'}\n` +
          `📢 Reprovado por: ${interaction.user}\n` +
          `📝 Motivo: ${motivo}`,
        ephemeral: false
      });
    }
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