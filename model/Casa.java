package model;

public class Casa extends Imovel {
    private boolean temQuintal;
    private double areaConstruida;

    public Casa() {
    }

    public Casa(int id, String codigo, String titulo, String endereco, String bairro,
                String finalidade, double preco, String status, int quartos, int banheiros,
                String imagem, String descricao, double areaConstruida, boolean temQuintal) {
        super(id, codigo, titulo, endereco, bairro, finalidade, preco, status, quartos, banheiros, imagem, descricao);
        this.areaConstruida = areaConstruida;
        this.temQuintal = temQuintal;
    }

    @Override
    public double calcularValorMetroQuadrado() {
        return areaConstruida > 0 ? getPreco() / areaConstruida : 0.0;
    }

    @Override
    public boolean aprovarProposta(double valor) {
        if (!"DISPONIVEL".equals(getStatus()) || valor <= 0 || valor > getPreco()) return false;
        setStatus("RESERVADO");
        return true;
    }

    @Override
    public void rejeitarProposta() { }

    public boolean isTemQuintal() { return temQuintal; }
    public double getAreaConstruida() { return areaConstruida; }
}