# Morada — CRM imobiliário

MVP de um CRM imobiliário com interfaces React para corretores e clientes, e
API REST em Java/Spring Boot. O acesso apresenta as telas de login do cliente e
do corretor inspiradas no protótipo Figma. O painel do corretor segue a mesma
referência visual; a área do cliente oferece pesquisa, filtros, favoritos e
solicitação de contato.

## Tecnologias

- React 18, Vite e Lucide
- Java 25 (LTS) e Spring Boot 3.5
- Domínio Java orientado a objetos: `Pessoa`, `Cliente`, `Corretor`, `Imovel`,
  `Apartamento`, `Casa`, `Proposta` e `SistemaCRM`

## Executar localmente

Pré-requisitos: JDK 25 (LTS) ou superior, Maven 3.6+ e Node.js 20 ou superior.

1. Inicie a API na raiz deste projeto:

   ```powershell
   mvn spring-boot:run
   ```

2. Em outro terminal, instale as dependências e inicie o React:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Abra `http://localhost:5173`. A API fica em `http://localhost:8080`.

## API disponível

- `GET /api/imoveis` — lista imóveis; aceita `busca`, `tipo` e `finalidade`.
- `GET /api/dashboard` — indicadores e tarefas do painel do corretor.
- `GET /api/leads` — lista solicitações de contato recebidas.
- `POST /api/leads` — registra solicitação de contato de um cliente.

O cadastro de lead exige nome, e-mail e telefone válidos. Nome e e-mail aceitam
até 100 e 254 caracteres, respectivamente; telefone deve conter de 10 a 15
dígitos; mensagem é opcional e aceita até 1000 caracteres.

Exemplo de cadastro de lead:

```json
{
  "nome": "Marina Almeida",
  "email": "marina@example.com",
  "telefone": "(19) 99999-9999",
  "imovelId": 14,
  "mensagem": "Gostaria de agendar uma visita."
}
```

## Escopo deste MVP

As telas de login são demonstrativas: enviar o formulário abre a interface do
perfil selecionado, mas não valida credenciais, cria sessões seguras ou protege
a API. Recuperação de senha e solicitação de primeiro acesso também são
orientações visuais, ainda sem integração. Não use dados reais ou senhas reais
neste protótipo.

Os dados de imóveis e tarefas são exemplos carregados em memória; leads
permanecem disponíveis somente enquanto a API está em execução, e o histórico
visível ao cliente existe apenas durante a sessão atual do navegador. PostgreSQL,
persistência, cadastro/edição de imóveis, autenticação e autorização reais,
agenda e fluxo completo de propostas são próximos passos para uma implantação.

## Estrutura principal

```text
api/                     Controladores REST, DTOs e inicialização Spring
controller/              Proposta e coordenação do domínio (SistemaCRM)
exception/                Exceções de domínio
interfaces/               Contratos de comportamento
model/                    Entidades e especializações de imóveis
service/                  Regras de aplicação e catálogo de demonstração
frontend/src/             Interface React responsiva para cliente e corretor
```
