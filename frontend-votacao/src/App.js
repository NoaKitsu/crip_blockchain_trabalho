import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import abi from "./abi/VotacaoABI.json";
import { ethers } from "ethers";

async function getContract() {
  if (!window.ethereum) {
    alert("MetaMask não detectada!");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const CONTRACT_ADDRESS = "0xC36799aEAA9a63ECB7a84300839253e05caCD70F";
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

export default function App() {
  const [account, setAccount] = useState(null);

  async function conectarCarteira() {
    if (!window.ethereum) {
      alert("MetaMask não detectada!");
      return;
    }
    const contas = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(contas[0]);
  }

  return (
    <Router>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">DApp Votação</h1>
        
        <button onClick={conectarCarteira} className="p-2 bg-blue-400 rounded-xl text-white">
          Conectar MetaMask
        </button>

        {account && (
          <p className="mt-2 p-2 bg-green-200 rounded-xl">
            Conta conectada: <strong>{account}</strong>
          </p>
        )}
        
        <nav className="space-y-4 grid">
          <Link className="p-4 bg-gray-200 rounded-xl" to="/buscar">Buscar Enquete</Link>
          <Link className="p-4 bg-gray-200 rounded-xl" to="/criar">Criar Enquete</Link>
          <Link className="p-4 bg-gray-200 rounded-xl" to="/votar">Votar</Link>
          <Link className="p-4 bg-gray-200 rounded-xl" to="/encerrar">Encerrar Enquete</Link>
        </nav>

        <Routes>
          <Route path="/buscar" element={<BuscarEnquete />} />
          <Route path="/criar" element={<CriarEnquete />} />
          <Route path="/votar" element={<VotarEnquete />} />
          <Route path="/encerrar" element={<EncerrarEnquete />} />
        </Routes>
      </div>
    </Router>
  );
}

function BuscarEnquete() {
  const [id, setId] = useState("");
  const [info, setInfo] = useState(null);

  async function buscar() {
  const c = await getContract();
  const dados = await c.obterInfoEnquete(id);
  setInfo({ titulo: dados[0], ativa: dados[1], opcoes: dados[2], votos: dados[3] });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Buscar Enquete</h2>
      <input className="border p-2" value={id} onChange={(e) => setId(e.target.value)} />
      <button className="p-2 bg-blue-300 rounded" onClick={buscar}>Buscar</button>


      {info && (
        <div className="mt-4">
          <h3 className="font-semibold">{info.titulo}</h3>
          <p>Status: {info.ativa ? "Ativa" : "Encerrada"}</p>
          {info.opcoes.map((op, i) => (
            <p key={i}>{op} — votos: {info.votos[i].toString()}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function CriarEnquete() {
  const [titulo, setTitulo] = useState("");
  const [opcoes, setOpcoes] = useState("");

  async function criar() {
    try {
      const c = await getContract();
      const lista = opcoes.split(",").map((o) => o.trim());
      const tx = await c.criarEnquete(titulo, lista);
      await tx.wait();
      alert("Enquete criada!");
    } catch (error) {
    if (error.code === "ACTION_REJECTED") {
        alert("Você recusou a transação na MetaMask.");
    } else {
        alert("Erro inesperado: " + error.message);
    }
}
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Criar Enquete</h2>
      <input className="border p-2 w-full" placeholder="Titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Opções separadas por vírgula" value={opcoes} onChange={(e) => setOpcoes(e.target.value)} />
      <button className="p-2 bg-green-300 rounded" onClick={criar}>Criar</button>
    </div>
  );
}

function VotarEnquete() {
  const [id, setId] = useState("");
  const [opcao, setOpcao] = useState("");

  async function votar() {
    try {
      const c = await getContract();
      const tx = await c.votarEnquete(Number(id), Number(opcao));
      await tx.wait();
      alert("Voto registrado!");
      } catch (error) {
    if (error.code === "ACTION_REJECTED") {
        alert("Você recusou a transação na MetaMask.");
    } else {
        alert("Erro inesperado: " + error.message);
    }
}
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Votar</h2>
      <input className="border p-2" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input className="border p-2" placeholder="Opção (índice)" value={opcao} onChange={(e) => setOpcao(e.target.value)} />
      <button className="p-2 bg-yellow-300 rounded" onClick={votar}>Votar</button>
    </div>
  );
}

function EncerrarEnquete() {
  const [id, setId] = useState("");

  async function encerrar() {
    try {
      const c = await getContract();
      const tx = await c.encerrarEnquete(Number(id));
      await tx.wait();
      alert("Enquete encerrada!");
    } catch (error) {
    if (error.code === "ACTION_REJECTED") {
        alert("Você recusou a transação na MetaMask.");
    } else {
        alert("Erro inesperado: " + error.message);
    }
}
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Encerrar Enquete</h2>
      <input className="border p-2" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <button className="p-2 bg-red-300 rounded" onClick={encerrar}>Encerrar</button>
    </div>
  );
}