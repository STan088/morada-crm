package model;

public class Apartamento extends Imovel {
    private int andar;
    private double valorCondominio;
    private double area;

    public Apartamento() {
    }

    public Apartamento(int id, String codigo, String titulo, String endereco, String bairro,
                       String finalidade, double preco, String status, int quartos, int banheiros,
                       String imagem, String descricao, double area, int andar, double valorCondominio) {
        super(id, codigo, titulo, endereco, bairro, finalidade, preco, status, quartos, banheiros, imagem, descricao);
        this.area = area;
        this.andar = andar;
        this.valorCondominio = valorCondominio;
    }

    @Override
    public double calcularValorMetroQuadrado() {
        return area > 0 ? getPreco() / area : 0.0;
    }

    @Override
    public boolean aprovarProposta(double valor) {
        if (!"DISPONIVEL".equals(getStatus()) || valor <= 0 || valor > getPreco()) return false;
        setStatus("RESERVADO");
        return true;
    }

    @Override
    public void rejeitarProposta() { }

    public int getAndar() { return andar; }
    public double getValorCondominio() { return valorCondominio; }
    public double getArea() { return area; }
}