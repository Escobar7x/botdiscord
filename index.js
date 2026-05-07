const { 
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require('discord.js');

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

// Setup painel farm
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!farmsetup') {

    const painel = await message.channel.send(
`📦 CONTROLE DE FARM

Reaja com 📩 para abrir ticket.

Envie no ticket:
📸 Print da meta no baú
💰 Print do dinheiro no cofre
👤 Nome/ID`
    );

    await painel.react('📩');
  }
});

// Abrir e fechar ticket
client.on('messageReactionAdd', async (reaction, user) => {

  if (user.bot) return;

  if (reaction.partial) await reaction.fetch();

  const guild = reaction.message.guild;

  // Abrir ticket
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
            PermissionsBitField.Flags.AttachFiles
          ]
        }
      ]
    });

    const ticket = await canal.send(
`📦 TICKET FARM

Olá <@${user.id}>!

Envie:
📸 Print da meta no baú
💰 Print do dinheiro no cofre
👤 Nome/ID

🔒 Staff reage para fechar ticket.`
    );

    await ticket.react('🔒');
  }

  // Fechar ticket
  if (reaction.emoji.name === '🔒') {

    if (!reaction.message.channel.name.startsWith('farm-')) return;

    await reaction.message.channel.send(
'🔒 Ticket será fechado em 5 segundos...'
    );

    setTimeout(() => {
      reaction.message.channel.delete();
    }, 5000);
  }

});

client.login(process.env.TOKEN);

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web iniciado');
});