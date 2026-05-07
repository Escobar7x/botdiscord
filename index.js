const { 
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require('discord.js');

const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

client.once('ready', () => {
  console.log('Bot ligado!');
});

// COMANDOS DE VENDA + FARM
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const comando = args[0];
  const valor = Number(args[1]);

  // VENDA NORMAL
  if (comando === '!venda') {
    if (!valor) return message.reply('Use: !venda 1000');

    const vendedor = valor * 0.15;
    const bau = valor - vendedor;

    message.reply(
      '💰 VENDA REALIZADA\n\n' +
      '📦 Valor: $' + valor.toFixed(2) + '\n' +
      '👤 Vendedor recebe: $' + vendedor.toFixed(2) + '\n' +
      '🏦 Baú recebe: $' + bau.toFixed(2)
    );
  }

  // VENDA PARCERIA
  if (comando === '!parceria') {
    if (!valor) return message.reply('Use: !parceria 1000');

    const desconto = valor * 0.90;
    const vendedor = desconto * 0.15;
    const bau = desconto - vendedor;

    message.reply(
      '🤝 VENDA PARCERIA\n\n' +
      '💵 Valor com desconto: $' + desconto.toFixed(2) + '\n' +
      '👤 Vendedor recebe: $' + vendedor.toFixed(2) + '\n' +
      '🏦 Baú recebe: $' + bau.toFixed(2)
    );
  }

  // PAINEL FARM
  if (comando === '!farmsetup') {
    const painel = await message.channel.send(
      '📦 CONTROLE DE FARM\n\n' +
      'Reaja com 📩 para abrir ticket.\n\n' +
      'Envie no ticket:\n' +
      '📸 Print da meta no baú\n' +
      '💰 Print do dinheiro no cofre\n' +
      '👤 Nome/ID'
    );

    await painel.react('📩');
  }
});

// REAÇÃO PARA ABRIR/FECHAR TICKET
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) await reaction.fetch();

  const guild = reaction.message.guild;

  // ABRIR TICKET FARM
  if (reaction.emoji.name === '📩') {
    const canal = await guild.channels.create({
      name: `farm-${user.username}`,
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
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const ticket = await canal.send(
      '📦 TICKET FARM\n\n' +
      `Olá <@${user.id}>!\n\n` +
      'Envie:\n' +
      '📸 Print da meta no baú\n' +
      '💰 Print do dinheiro no cofre\n' +
      '👤 Nome/ID\n\n' +
      '🔒 Staff reage para fechar ticket.'
    );

    await ticket.react('🔒');
  }

  // FECHAR TICKET FARM
  if (reaction.emoji.name === '🔒') {
    if (!reaction.message.channel.name.startsWith('farm-')) return;

    await reaction.message.channel.send('🔒 Ticket será fechado em 5 segundos...');

    setTimeout(() => {
      reaction.message.channel.delete();
    }, 5000);
  }
});

client.login(process.env.TOKEN);

// SERVIDOR WEB PARA RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});