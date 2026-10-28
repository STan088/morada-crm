package controller;

import model.Cliente;
import model.Imovel;
import java.time.LocalDate;

public class Proposta {
    private Cliente cliente;
    private Imovel imovel;
    private double valorOferecido;
    private LocalDate data;

    public Proposta() {
    }

    public Proposta(Cliente cliente, Imovel imovel, double valorOferecido, LocalDate data) {
        this.cliente = cliente;
        this.imovel = imovel;
        this.valorOferecido = valorOferecido;
        this.data = data;
    }

    public Cliente getCliente() { return cliente; }
    public Imovel getImovel() { return imovel; }
    public double getValorOferecido() { return valorOferecido; }
    public LocalDate getData() { return data; }
}