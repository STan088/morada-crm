package service;

import api.DashboardResponse;
import api.ImovelResponse;
import api.LeadRequest;
import api.LeadResponse;
import api.TarefaResponse;
import controller.SistemaCRM;
import exception.DadosImovelInvalidosException;
import model.Apartamento;
import model.Casa;
import model.Imovel;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImobiliariaService {
    private final SistemaCRM sistemaCRM = new SistemaCRM();
    private final AtomicLong sequenciaLeads = new AtomicLong(1);
    private final java.util.concurrent.CopyOnWriteArrayList<LeadResponse> leads = new java.util.concurrent.CopyOnWriteArrayList<>();
    private final List<TarefaResponse> tarefas = new java.util.concurrent.CopyOnWriteArrayList<>(List.of(
            new TarefaResponse(1, "Enviar contraproposta para Pedro Alves", "Apartamento em Cambuí · IM-021", false),
            new TarefaResponse(2, "Retornar contato de Ana Souza", "Busca apartamento até R$ 700 mil", false),
            new TarefaResponse(3, "Confirmar documentos com Rafael", "Casa no Parque Prado · IM-011", false),
            new TarefaResponse(4, "Agendar visita com Marina", "Apartamento com varanda · IM-014", true),
            new TarefaResponse(5, "Atualizar anúncio do imóvel IM-018", "Casa com jardim e piscina", true)
    ));

    public ImobiliariaService() {
        cadastrar(new Apartamento(14, "IM-014", "Apartamento com varanda", "Rua dos Alecrins, 520",
                "Cambuí", "VENDA", 780000, "DISPONIVEL", 3, 2,
                "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
                "Apartamento iluminado, com varanda ampla, marcenaria planejada e vista livre.", 92, 8, 680));
        cadastrar(new Casa(18, "IM-018", "Casa com jardim e piscina", "Rua das Paineiras, 84",
                "Taquaral", "VENDA", 890000, "DISPONIVEL", 3, 2,
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
                "Casa térrea em rua tranquila, com jardim, piscina e área gourmet.", 180, true));
        cadastrar(new Apartamento(23, "IM-023", "Seu novo canto no Cambuí", "Rua Coronel Quirino, 1150",
                "Cambuí", "VENDA", 640000, "DISPONIVEL", 2, 2,
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
                "Apartamento acolhedor perto de cafés, serviços e áreas verdes.", 78, 5, 540));
        cadastrar(new Apartamento(9, "IM-009", "Apartamento perto do parque", "Avenida Júlio Prestes, 312",
                "Taquaral", "LOCACAO", 3800, "DISPONIVEL", 2, 1,
                "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
                "Pronto para morar, com ambientes integrados e ótima iluminação natural.", 74, 3, 490));
        cadastrar(new Casa(11, "IM-011", "Casa espaçosa no Parque Prado", "Rua Luiz Pereira, 92",
                "Parque Prado", "VENDA", 720000, "DISPONIVEL", 3, 3,
                "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85",
                "Casa com ambientes amplos, quintal privativo e duas vagas cobertas.", 155, true));
        cadastrar(new Apartamento(21, "IM-021", "Apartamento contemporâneo", "Rua Maria Monteiro, 850",
                "Cambuí", "VENDA", 970000, "RESERVADO", 3, 2,
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
                "Projeto contemporâneo com varanda gourmet e lazer completo.", 110, 12, 820));
    }

    public List<ImovelResponse> listarImoveis(String busca, String tipo, String finalidade) {
        String termo = normalizar(busca);
        String tipoNormalizado = normalizar(tipo);
        String finalidadeNormalizada = normalizar(finalidade);
        return sistemaCRM.listarImoveis().stream()
                .filter(imovel -> {
                    String texto = normalizar(imovel.getCodigo() + " " + imovel.getTitulo() + " "
                            + imovel.getBairro() + " " + imovel.getEndereco());
                    return termo.isEmpty() || texto.contains(termo);
                })
                .filter(imovel -> tipoNormalizado.isEmpty()
                        || ("apartamento".equals(tipoNormalizado) && imovel instanceof Apartamento)
                        || ("casa".equals(tipoNormalizado) && imovel instanceof Casa))
                .filter(imovel -> finalidadeNormalizada.isEmpty()
                        || normalizar(imovel.getFinalidade()).equals(finalidadeNormalizada))
                .map(this::paraResposta)
                .collect(Collectors.toList());
    }

    public DashboardResponse consultarDashboard() {
        List<ImovelResponse> imoveis = listarImoveis(null, null, null);
        return new DashboardResponse(
                (int) imoveis.stream().filter(i -> "DISPONIVEL".equals(i.status())).count(),
                imoveis.size(),
                leads.size(),
                (int) tarefas.stream().filter(t -> !t.concluida()).count(),
                List.copyOf(tarefas)
        );
    }

    public List<LeadResponse> listarLeads() {
        return List.copyOf(leads);
    }

    public LeadResponse registrarLead(LeadRequest lead) {
        if (lead == null || vazio(lead.nome()) || vazio(lead.email()) || vazio(lead.telefone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Informe nome, e-mail válido e telefone para solicitar contato.");
        }
        String nome = lead.nome().trim();
        String email = lead.email().trim();
        String telefone = lead.telefone().trim();
        String mensagem = lead.mensagem() == null ? "" : lead.mensagem().trim();
        String telefoneNumerico = telefone.replaceAll("\\D", "");
        if (nome.length() > 100 || email.length() > 254
                || !email.matches("^[^\\s@.]+(?:\\.[^\\s@.]+)*@[^\\s@.]+(?:\\.[^\\s@.]+)+$")
                || !telefone.matches("[+0-9().\\s-]+")
                || telefoneNumerico.length() < 10 || telefoneNumerico.length() > 15
                || mensagem.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Informe nome, e-mail e telefone válidos. A mensagem deve ter até 1000 caracteres.");
        }
        if (lead.imovelId() != null && sistemaCRM.listarImoveis().stream()
                .noneMatch(imovel -> imovel.getId() == lead.imovelId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado.");
        }
        String interesse = lead.imovelId() == null ? "Interesse em conhecer imóveis"
                : sistemaCRM.listarImoveis().stream()
                        .filter(imovel -> imovel.getId() == lead.imovelId())
                        .map(Imovel::getTitulo)
                        .findFirst()
                        .orElse("Imóvel");
        LeadResponse registrado = new LeadResponse(sequenciaLeads.getAndIncrement(),
                nome, email, telefone, interesse,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM, HH:mm")),
                mensagem,
                "Novo lead");
        leads.add(registrado);
        return registrado;
    }

    private void cadastrar(Imovel imovel) {
        try {
            sistemaCRM.cadastrarImovel(imovel);
        } catch (DadosImovelInvalidosException exception) {
            throw new IllegalStateException("Não foi possível carregar o catálogo inicial.", exception);
        }
    }

    private ImovelResponse paraResposta(Imovel imovel) {
        boolean apartamento = imovel instanceof Apartamento;
        double area = apartamento ? ((Apartamento) imovel).getArea() : ((Casa) imovel).getAreaConstruida();
        double condominio = apartamento ? ((Apartamento) imovel).getValorCondominio() : 0;
        int andar = apartamento ? ((Apartamento) imovel).getAndar() : 0;
        boolean quintal = !apartamento && ((Casa) imovel).isTemQuintal();
        return new ImovelResponse(imovel.getId(), imovel.getCodigo(),
                apartamento ? "APARTAMENTO" : "CASA", imovel.getFinalidade(), imovel.getTitulo(),
                imovel.getEndereco(), imovel.getBairro(), "Campinas", "SP", area, imovel.getQuartos(),
                imovel.getBanheiros(), imovel.getPreco(), imovel.getStatus(), imovel.getImagem(),
                imovel.getDescricao(), condominio, andar, quintal);
    }

    private String normalizar(String valor) {
        if (valor == null) {
            return "";
        }
        return Normalizer.normalize(valor.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private boolean vazio(String valor) {
        return valor == null || valor.isBlank();
    }
}
