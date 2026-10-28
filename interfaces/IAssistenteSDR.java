package interfaces;

import model.Cliente;
import model.Imovel;
import java.util.List;

public interface IAssistenteSDR {
    String classificarLead(Cliente cliente);
    List<Imovel> buscarImovelIdeal(String perfil);
}
