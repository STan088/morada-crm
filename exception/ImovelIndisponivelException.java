package exception;

public class ImovelIndisponivelException extends RuntimeException {
    public ImovelIndisponivelException(String mensagem) {
        super(mensagem);
    }
}