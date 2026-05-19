// CRIAR CANAL COM MENSAGEM FIXADA
if (message.content.startsWith('!canalfixo ')) {

  const texto = message.content.replace('!canalfixo ', '');

  const partes = texto.split('|');

  const nomeCanal = partes[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const mensagemFixada = partes[1];

  if (!mensagemFixada) {
    return message.reply(
      'Use:\n!canalfixo conduta | mensagem'
    );
  }

  const canal = await message.guild.channels.create({
    name: nomeCanal,
    type: 0
  });

  const msg = await canal.send(mensagemFixada);

  await msg.pin();

  message.reply(
    `✅ Canal criado e mensagem fixada em #${nomeCanal}`
  );
}