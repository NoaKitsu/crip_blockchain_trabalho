import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotacaoModule", (m) => {
  // O contrato Votacao não possui parâmetros no construtor,
  // portanto basta chamá-lo diretamente sem argumentos.
  const votacao = m.contract("Votacao");

  // Retorna o contrato para referência no deploy
  return { votacao };
});

//0xC36799aEAA9a63ECB7a84300839253e05caCD70F