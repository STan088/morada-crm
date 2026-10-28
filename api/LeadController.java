package api;

import org.springframework.http.HttpStatus;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import service.ImobiliariaService;

@RestController
@RequestMapping("/api/leads")
public class LeadController {
    private final ImobiliariaService imobiliariaService;

    public LeadController(ImobiliariaService imobiliariaService) {
        this.imobiliariaService = imobiliariaService;
    }

    @GetMapping
    public List<LeadResponse> listar() {
        return imobiliariaService.listarLeads();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeadResponse registrar(@RequestBody LeadRequest lead) {
        return imobiliariaService.registrarLead(lead);
    }
}
