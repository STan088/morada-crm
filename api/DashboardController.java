package api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import service.ImobiliariaService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final ImobiliariaService imobiliariaService;

    public DashboardController(ImobiliariaService imobiliariaService) {
        this.imobiliariaService = imobiliariaService;
    }

    @GetMapping
    public DashboardResponse consultar() {
        return imobiliariaService.consultarDashboard();
    }
}
