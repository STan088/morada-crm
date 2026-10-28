package api;

public record LeadRequest(String nome, String email, String telefone, Integer imovelId, String mensagem) {
}
