package controller;

import model.Apartamento;
import model.Casa;
import model.Imovel;
import exception.DadosImovelInvalidosException;
import exception.ImovelIndisponivelException;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;

public class SistemaCRM {
    private final Map<Integer, Imovel> catalogoImoveis = new LinkedHashMap<>();
    private final List<Proposta> historicoPropostas = new ArrayList<>();

    public synchronized void cadastrarImovel(Imovel imovel) throws DadosImovelInvalidosException {
        if (imovel == null || imovel.getId() <= 0 || !Double.isFinite(imovel.getPreco())
                || imovel.getPreco() <= 0 || vazio(imovel.getCodigo()) || vazio(imovel.getTitulo())
                || vazio(imovel.getEndereco()) || vazio(imovel.getBairro())
                || !("VENDA".equals(imovel.getFinalidade()) || "LOCACAO".equals(imovel.getFinalidade()))
                || !("DISPONIVEL".equals(imovel.getStatus()) || "RESERVADO".equals(imovel.getStatus()))
                || imovel.getQuartos() < 0 || imovel.getBanheiros() < 0
                || !dimensoesValidas(imovel)) {
            throw new DadosImovelInvalidosException("Imóvel com dados obrigatórios inválidos.");
        }
        if (catalogoImoveis.putIfAbsent(imovel.getId(), imovel) != null) {
            throw new DadosImovelInvalidosException("Já existe um imóvel com esse identificador.");
        }
    }

    public synchronized void registrarProposta(Proposta proposta) throws ImovelIndisponivelException {
        if (proposta == null || proposta.getCliente() == null || proposta.getImovel() == null
                || proposta.getData() == null || !Double.isFinite(proposta.getValorOferecido())
                || proposta.getValorOferecido() <= 0) {
            throw new IllegalArgumentException("A proposta deve conter cliente, imóvel, data e valor válido.");
        }
        Imovel imovelCadastrado = catalogoImoveis.get(proposta.getImovel().getId());
        if (imovelCadastrado != proposta.getImovel()
                || !"DISPONIVEL".equals(imovelCadastrado.getStatus())) {
            throw new ImovelIndisponivelException("O imóvel não está disponível para propostas.");
        }
        historicoPropostas.add(proposta);
    }

    public synchronized List<Imovel> listarImoveis() { return new ArrayList<>(catalogoImoveis.values()); }
    public synchronized List<Proposta> listarPropostas() { return new ArrayList<>(historicoPropostas); }

    private boolean dimensoesValidas(Imovel imovel) {
        if (imovel instanceof Apartamento apartamento) {
            return Double.isFinite(apartamento.getArea()) && apartamento.getArea() > 0
                    && Double.isFinite(apartamento.getValorCondominio())
                    && apartamento.getValorCondominio() >= 0;
        }
        if (imovel instanceof Casa casa) {
            return Double.isFinite(casa.getAreaConstruida()) && casa.getAreaConstruida() > 0;
        }
        return false;
    }

    private boolean vazio(String valor) {
        return valor == null || valor.isBlank();
    }
}