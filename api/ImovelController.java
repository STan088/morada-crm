package api;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import service.ImobiliariaService;

@RestController
@RequestMapping("/api/imoveis")
public class ImovelController {
    private final ImobiliariaService imobiliariaService;

    public ImovelController(ImobiliariaService imobiliariaService) {
        this.imobiliariaService = imobiliariaService;
    }

    @GetMapping
    public List<ImovelResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String finalidade
    ) {
        return imobiliariaService.listarImoveis(busca, tipo, finalidade);
    }
}
