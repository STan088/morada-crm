package model;

import interfaces.INegociavel;

public abstract class Imovel implements INegociavel {
    private int id;
    protected String endereco;
    protected double preco;
    protected String status;
    protected String codigo;
    protected String titulo;
    protected String bairro;
    protected String finalidade;
    protected int quartos;
    protected int banheiros;
    protected String imagem;
    protected String descricao;

    public abstract double calcularValorMetroQuadrado();

    protected Imovel() {
    }

    protected Imovel(int id, String codigo, String titulo, String endereco, String bairro,
                    String finalidade, double preco, String status, int quartos,
                    int banheiros, String imagem, String descricao) {
        this.id = id;
        this.codigo = codigo;
        this.titulo = titulo;
        this.endereco = endereco;
        this.bairro = bairro;
        this.finalidade = finalidade;
        this.preco = preco;
        this.status = status;
        this.quartos = quartos;
        this.banheiros = banheiros;
        this.imagem = imagem;
        this.descricao = descricao;
    }

    public int getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getTitulo() { return titulo; }
    public String getEndereco() { return endereco; }
    public String getBairro() { return bairro; }
    public String getFinalidade() { return finalidade; }
    public double getPreco() { return preco; }
    public String getStatus() { return status; }
    public int getQuartos() { return quartos; }
    public int getBanheiros() { return banheiros; }
    public String getImagem() { return imagem; }
    public String getDescricao() { return descricao; }
    public void setStatus(String status) { this.status = status; }
}