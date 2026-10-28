package model;

public class Corretor extends Pessoa {
    private String creci;
    private double taxaComissao;

    public Corretor() {
    }

    public Corretor(String nome, String cpf, String telefone, String creci, double taxaComissao) {
        super(nome, cpf, telefone);
        this.creci = creci;
        this.taxaComissao = taxaComissao;
    }

    public String getCreci() { return creci; }
    public double getTaxaComissao() { return taxaComissao; }
    public void setCreci(String creci) { this.creci = creci; }
    public void setTaxaComissao(double taxaComissao) { this.taxaComissao = taxaComissao; }
}