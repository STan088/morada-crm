package api;

public record ImovelResponse(
        int id,
        String codigo,
        String tipo,
        String finalidade,
        String titulo,
        String endereco,
        String bairro,
        String cidade,
        String estado,
        double area,
        int quartos,
        int banheiros,
        double preco,
        String status,
        String imagem,
        String descricao,
        double condominio,
        int andar,
        boolean quintal
) {
}
