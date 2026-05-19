// CRIAR CATEGORIA COM VÁRIOS CANAIS
if (message.content.startsWith('!categoria ')) {

  const texto = message.content.replace('!categoria ', '');

  const partes = texto.split('|');

  if (partes.length < 2) {
    return message.reply(
      'Use:\n!categoria BAEP | conduta,regras,avisos'
    );
  }

  const nomeCategoria = partes[0].trim();

  const canais = partes[1].split(',');

  // CRIAR CATEGORIA
  const categoria = await message.guild.channels.create({
    name: nomeCategoria,
    type: 4
  });

  // CRIAR CANAIS
  for (const canalNome of canais) {

    const nomeFormatado = canalNome
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
    `✅ Categoria "${nomeCategoria}" criada com sucesso.`
  );
}