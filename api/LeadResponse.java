package api;

public record LeadResponse(
        long id,
        String nome,
        String email,
        String telefone,
        String interesse,
        String data,
        String mensagem,
        String status
) {
}
