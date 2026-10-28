package api;

import java.util.List;

public record DashboardResponse(
        int imoveisDisponiveis,
        int imoveisNaCarteira,
        int novosLeads,
        int tarefasPendentes,
        List<TarefaResponse> tarefas
) {
}
