package service;

import api.LeadRequest;
import controller.Proposta;
import controller.SistemaCRM;
import exception.DadosImovelInvalidosException;
import exception.ImovelIndisponivelException;
import model.Apartamento;
import model.Cliente;
import model.Imovel;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ImobiliariaServiceTest {
    private final ImobiliariaService service = new ImobiliariaService();

    @Test
    void filtersPropertiesByTypeAndPurpose() {
        assertEquals(2, service.listarImoveis(null, "casa", null).size());
        assertEquals(1, service.listarImoveis(null, null, "locacao").size());
        assertEquals("IM-014", service.listarImoveis("cambuí", "apartamento", "venda").get(0).codigo());
        assertEquals(3, service.listarImoveis("cambui", "apartamento", "venda").size());
    }

    @Test
    void registersContactAndCountsItOnDashboard() {
        var lead = service.registrarLead(new LeadRequest(
                "Marina Almeida", "marina@example.com", "19999999999", 14, "Agendar visita"
        ));

        assertEquals("Apartamento com varanda", lead.interesse());
        assertEquals(1, service.listarLeads().size());
        assertEquals(1, service.consultarDashboard().novosLeads());
    }

    @Test
    void rejectsInvalidContactInformation() {
        var exception = assertThrows(ResponseStatusException.class, () -> service.registrarLead(
                new LeadRequest("Marina", "email-invalido", "19999999999", null, "")
        ));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void rejectsInvalidPhoneNumber() {
        assertThrows(ResponseStatusException.class, () -> service.registrarLead(
                new LeadRequest("Marina", "marina@example.com", "telefone-inválido", null, "")
        ));
    }

    @Test
    void rejectsInvalidPropertiesAndProposals() throws Exception {
        SistemaCRM crm = new SistemaCRM();
        Imovel imovel = new Apartamento(14, "IM-014", "Apartamento", "Rua A", "Cambuí",
                "VENDA", 100000, "DISPONIVEL", 2, 1, "", "", 60, 2, 0);
        crm.cadastrarImovel(imovel);
        Cliente cliente = new Cliente("Marina", "123", "19999999999", 100000, "Apartamento");

        assertThrows(DadosImovelInvalidosException.class, () -> crm.cadastrarImovel(
                new Apartamento(15, "IM-015", "Inválido", "Rua B", "Centro",
                        "VENDA", Double.NaN, "DISPONIVEL", 2, 1, "", "", 60, 2, 0)
        ));
        assertThrows(ImovelIndisponivelException.class, () -> crm.registrarProposta(
                new Proposta(cliente, new Apartamento(14, "IM-014", "Outro", "Rua A", "Cambuí",
                        "VENDA", 100000, "DISPONIVEL", 2, 1, "", "", 60, 2, 0),
                        90000, LocalDate.now())
        ));
        crm.registrarProposta(new Proposta(cliente, imovel, 90000, LocalDate.now()));
        assertEquals(1, crm.listarPropostas().size());
    }

    @Test
    void rejectsMalformedProposal() {
        assertThrows(IllegalArgumentException.class,
                () -> new SistemaCRM().registrarProposta(new Proposta()));
    }
}
