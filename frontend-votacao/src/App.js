import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import abi from "./abi/VotacaoABI.json";
import { ethers } from "ethers";
import "./App.css";

async function getContract() {
  if (!window.ethereum) {
    alert("MetaMask não detectado! Instalar a extensão para utilizar o programa.");
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
      alert("MetaMask não detectada! Instalar a extensão para utilizar o programa.");
      return;
    }

    if (account) {
      setAccount(null);
      return;
    }

    const contas = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(contas[0]);
  }

  return (
    <Router>
      <div className="container">
        <h1 className="title">DApp Votação</h1>

        <button onClick={conectarCarteira} className="btn btn-primary">
           {account ? "Desconectar" : "Conectar MetaMask"}
        </button>

        {account && (
          <p className="connected-box">
            Conta conectada: <strong>{account}</strong>
          </p>
        )}

        <nav className="menu">
          <Link className="menu-item" to="/buscar">Buscar Enquete</Link>
          <Link className="menu-item" to="/criar">Criar Enquete</Link>
          <Link className="menu-item" to="/votar">Votar</Link>
          <Link className="menu-item" to="/encerrar">Encerrar Enquete</Link>
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
    <div className="page">
      <h2 className="subtitle">Buscar Enquete</h2>

      <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
      <button className="btn btn-primary" onClick={buscar}>Buscar</button>

      {info && (
        <div className="card">
          <h3 className="card-title">{info.titulo}</h3>
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
    <div className="page">
      <h2 className="subtitle">Criar Enquete</h2>

      <input className="input" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <input className="input" placeholder="Opções separadas por vírgula" value={opcoes} onChange={(e) => setOpcoes(e.target.value)} />

      <button className="btn btn-success" onClick={criar}>Criar</button>
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
    <div className="page">
      <h2 className="subtitle">Votar</h2>

      <input className="input" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input className="input" placeholder="Opção (índice)" value={opcao} onChange={(e) => setOpcao(e.target.value)} />

      <button className="btn btn-warning" onClick={votar}>Votar</button>
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
    <div className="page">
      <h2 className="subtitle">Encerrar Enquete</h2>

      <input className="input" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />

      <button className="btn btn-danger" onClick={encerrar}>Encerrar</button>
    </div>
  );
}
