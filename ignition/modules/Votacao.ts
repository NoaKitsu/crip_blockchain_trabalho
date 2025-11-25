import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotacaoModule", (m) => {

  const votacao = m.contract("Votacao");

  return { votacao };
});
