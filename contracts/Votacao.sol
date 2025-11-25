// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Votacao {
    //construindo structs das enquetes
    struct OpcaoVoto {
        string descricao;
        uint256 qtdeVotos;
    }

    struct InfoEnquete{
        string titulo;
        address criador;
        bool ativa;
        OpcaoVoto[] opcoes;
        mapping(address => bool) jaVotou;
    }

    mapping(uint256 => InfoEnquete) private enquetes;
    uint256 private qtdeEnquetes;

    //criando eventos
    event EnqueteCriada(uint256 idEnquete, string titulo, address criador);
    event VotoRegistrado(uint256 idEnquete, uint256 indiceOpcao, address votante);
    event EnqueteEncerrada(uint256 idEnquete, address criador);

    //funcao que cria enquetes
    function criarEnquete(string memory _titulo, string[] memory _opcoes) external {
        require(_opcoes.length >= 2, unicode"Precisa de ao menos 2 opções");
        
        qtdeEnquetes++;
        InfoEnquete storage novaEnquete = enquetes[qtdeEnquetes];
        novaEnquete.titulo = _titulo;
        novaEnquete.criador = msg.sender;
        novaEnquete.ativa = true;

        for (uint256 i = 0; i < _opcoes.length; i++) {
            novaEnquete.opcoes.push(OpcaoVoto({descricao: _opcoes[i], qtdeVotos: 0}));

        }

        emit EnqueteCriada(qtdeEnquetes, _titulo, msg.sender);
        
    }

    //funcao de voto nas enquetes
    function votarEnquete(uint256 _idEnquete, uint256 _indiceOpcao) external {
        InfoEnquete storage enquete = enquetes[_idEnquete];
        require(enquete.ativa, unicode"Enquete está encerrada");
        require(!enquete.jaVotou[msg.sender], unicode"Seu voto ja foi computado");
        require(_indiceOpcao < enquete.opcoes.length, unicode"Opcao Invalida");

        enquete.opcoes[_indiceOpcao].qtdeVotos++;
        enquete.jaVotou[msg.sender] = true;

        emit VotoRegistrado(_idEnquete, _indiceOpcao, msg.sender);
    
    }

    //funcao que finaliza uma enquete
    function encerrarEnquete(uint256 _idEnquete) external {
        InfoEnquete storage enquete = enquetes[_idEnquete];
        require(enquete.ativa, unicode"Enquete ja foi encerrada anteriormente");
        require(enquete.criador == msg.sender, unicode"Somente o criador da enquete pode encerra-la");

        enquete.ativa = false;

        emit EnqueteEncerrada(_idEnquete, msg.sender);
    
    }

    //funcao que busca certa enquete
    function obterInfoEnquete(uint256 _idEnquete) external view returns(
        string memory titulo,
        bool ativa,
        string[] memory descricaoOpcoes,
        uint256[] memory votosOpcoes
    )  {
        InfoEnquete storage enquete = enquetes[_idEnquete];

        uint256 qtdeOpcoes = enquete.opcoes.length;
        descricaoOpcoes = new string[](qtdeOpcoes);
        votosOpcoes = new uint256[](qtdeOpcoes);

        for(uint256 i = 0; i < qtdeOpcoes; i++){
            descricaoOpcoes[i] = enquete.opcoes[i].descricao;
            votosOpcoes[i] = enquete.opcoes[i].qtdeVotos;
        }

        return (enquete.titulo, enquete.ativa, descricaoOpcoes, votosOpcoes);
    }
}
