// import { ethers } from "ethers";
// import abi from "../abi/VotacaoABI.json";

// const CONTRACT_ADDRESS = "0xC36799aEAA9a63ECB7a84300839253e05caCD70F"; 

// export function getContract() {
//   if (!window.ethereum) {
//     alert("MetaMask não detectada!");
//     return;
//   }

//   const provider = new ethers.BrowserProvider(window.ethereum);
//   const signer = provider.getSigner();
//   return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
// }