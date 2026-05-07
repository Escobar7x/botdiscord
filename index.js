const { Client, GatewayIntentBits } = require('discord.js');

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

client.on('messageCreate', (message) => {

  if (message.author.bot) return;

  const args = message.content.split(' ');
  const comando = args[0];
  const valor = Number(args[1]);

  // Venda normal
  if (comando === '!venda') {

    if (!valor) {
      return message.reply('Use: !venda 1000');
    }

    const vendedor = valor * 0.15;
    const bau = valor - vendedor;

    message.reply(
      '💰 VENDA REALIZADA\n\n' +
      '📦 Valor: $' + valor.toFixed(2) + '\n' +
      '👤 Vendedor recebe: $' + vendedor.toFixed(2) + '\n' +
      '🏦 Baú recebe: $' + bau.toFixed(2)
    );
  }

  // Venda parceria
  if (comando === '!parceria') {

    if (!valor) {
      return message.reply('Use: !parceria 1000');
    }

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
