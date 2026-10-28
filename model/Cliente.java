package model;

public class Cliente extends Pessoa {
    private double orcamentoMaximo;
    private String perfilBusca;

    public Cliente() {
    }

    public Cliente(String nome, String cpf, String telefone, double orcamentoMaximo, String perfilBusca) {
        super(nome, cpf, telefone);
        this.orcamentoMaximo = orcamentoMaximo;
        this.perfilBusca = perfilBusca;
    }

    public double getOrcamentoMaximo() { return orcamentoMaximo; }
    public String getPerfilBusca() { return perfilBusca; }
    public void setOrcamentoMaximo(double orcamentoMaximo) { this.orcamentoMaximo = orcamentoMaximo; }
    public void setPerfilBusca(String perfilBusca) { this.perfilBusca = perfilBusca; }
}