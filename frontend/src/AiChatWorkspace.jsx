import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  ArrowUpRight,
  BedDouble,
  Tag,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { getInitials } from './utils';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractMaxBudget(normalizedMsg) {
  const milhaoMatch = normalizedMsg.match(/(\d+(?:[.,]\d+)?)\s*(?:milhao|milhoes|mi\b)/);
  if (milhaoMatch) {
    return parseFloat(milhaoMatch[1].replace(',', '.')) * 1_000_000;
  }

  const milMatch = normalizedMsg.match(/(\d+(?:[.,]\d+)?)\s*(?:mil|k\b)/);
  if (milMatch) {
    return parseFloat(milMatch[1].replace(',', '.')) * 1_000;
  }

  const rawMoneyMatch = normalizedMsg.match(
    /(?:ate|maximo|orcamento|valor|por|de|uns|faixa)?\s*(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d{4,7})/
  );
  if (rawMoneyMatch) {
    return parseFloat(rawMoneyMatch[1].replace(/\./g, ''));
  }

  return null;
}

// Converte trechos entre **texto** em negrito real sem exibir asteriscos
function renderFormattedText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function AiChatWorkspace({
  properties = [],
  onOpenProperty,
  onQuickLead,
  userName = 'Cliente',
  userEmail = '',
  userPhone = '',
}) {
  const firstName = userName.split(' ')[0];
  const userInitials = getInitials(userName);

  const [context, setContext] = useState({
    finalidade: null,
    tipo: null,
    localizacao: null,
    quartos: null,
    orcamentoMax: null,
    ultimoImovelFocado: null,
  });

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Olá, ${firstName}! Tudo bem? Eu sou a Clara, consultora digital aqui da Imobiliária Horizonte.\n\nEstou aqui para te ajudar desde a escolha do imóvel ideal até dúvidas sobre financiamento, documentação ou agendamento de visitas. Para começarmos: você está pensando em comprar ou alugar no momento?`,
      recommended: [],
      quickReplies: [
        'Quero comprar um imóvel',
        'Estou buscando para alugar',
        'Como funciona o financiamento?',
        'Quero ver os destaques da carteira',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scheduledIds, setScheduledIds] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleScheduleVisit(property) {
    if (scheduledIds.includes(property.id)) return;
    setScheduledIds((prev) => [...prev, property.id]);

    if (onQuickLead) {
      onQuickLead({
        nome: userName,
        email: userEmail || 'cliente@morada.com.br',
        telefone: userPhone || '(19) 99999-9999',
        imovelId: property.id,
        mensagem: `Solicitação de visita agendada via Consultora IA para o imóvel ${property.titulo} (${property.codigo}).`,
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: `Perfeito, ${firstName}! Já registrei sua solicitação de visita para o imóvel **${property.titulo}** (${property.codigo}) e notifiquei nossa equipe de corretores.\n\nVocê pode acompanhar a resposta direto na aba "Mensagens". Enquanto isso, gostaria de tirar alguma dúvida sobre valores, condomínio ou documentação desse imóvel?`,
        recommended: [],
        quickReplies: [
          'Quais documentos preciso?',
          'Como funciona o financiamento?',
          'Ver outras opções parecidas',
        ],
      },
    ]);
  }

  function buildConsultativeReply(userText) {
    const norm = normalizeText(userText);

    if (
      norm.includes('financiamento') ||
      norm.includes('financiar') ||
      norm.includes('fgts') ||
      norm.includes('entrada') ||
      norm.includes('parcela') ||
      norm.includes('banco')
    ) {
      return {
        text: `Ótima pergunta, ${firstName}! No financiamento imobiliário aqui pela Morada, normalmente funciona assim:\n\n• **Entrada:** A maioria dos bancos pede a partir de 20% do valor do imóvel (você pode usar seu saldo de **FGTS** para abater essa entrada, caso se enquadre nas regras do SFH).\n• **Renda:** A parcela mensal não pode ultrapassar 30% da renda familiar bruta comprovada.\n• **Aprovação:** Fazemos a simulação e pré-aprovação de crédito sem custo antes mesmo da assinatura do contrato.\n\nVocê já tem uma faixa de valor em mente para eu filtrar imóveis que cabem no seu planejamento?`,
        recommended: [],
        quickReplies: [
          'Sim, até R$ 800 mil',
          'Até R$ 1 milhão',
          'Mostrar imóveis à venda',
        ],
      };
    }

    if (
      norm.includes('document') ||
      norm.includes('garantia') ||
      norm.includes('fiador') ||
      norm.includes('caucao') ||
      norm.includes('seguro fianca') ||
      norm.includes('contrato')
    ) {
      return {
        text: `Sobre a parte burocrática, a gente descomplica tudo para você:\n\n• **Para Compra:** RG/CPF, certidão de estado civil, comprovante de residência e os 3 últimos comprovantes de renda (holerite ou declaração de IR).\n• **Para Locação:** Aceitamos **Seguro Fiança** (aprovação rápida sem precisar de terceiros), **Título de Capitalização** ou **Fiador** com imóvel quitado.\n\nVocê está avaliando compra ou locação para este momento?`,
        recommended: [],
        quickReplies: [
          'Estou avaliando compra',
          'Estou avaliando locação',
          'Ver imóveis disponíveis',
        ],
      };
    }

    if (
      norm.includes('visita') ||
      norm.includes('visitar') ||
      norm.includes('conhecer pessoalmente') ||
      norm.includes('agendar')
    ) {
      const targetProp = context.ultimoImovelFocado || properties.find((p) => p.status === 'DISPONIVEL');
      if (targetProp) {
        return {
          text: `Com certeza! Nossas visitas são acompanhadas por um corretor especialista, de segunda a sábado, em horários flexíveis.\n\nSe quiser agendar para este imóvel abaixo, basta clicar em **Agendar visita com corretor** que eu já deixo tudo encaminhado:`,
          recommended: [targetProp],
          quickReplies: ['Quero ver outras opções antes', 'Quais documentos preciso?'],
        };
      }
    }

    if (
      norm.includes('limpar') ||
      norm.includes('recomecar') ||
      norm.includes('outra busca') ||
      norm.includes('resetar')
    ) {
      setContext({
        finalidade: null,
        tipo: null,
        localizacao: null,
        quartos: null,
        orcamentoMax: null,
        ultimoImovelFocado: null,
      });
      return {
        text: `Combinado, ${firstName}! Zerei os critérios anteriores para começarmos do zero. O que você gostaria de buscar agora: compra ou locação?`,
        recommended: [],
        quickReplies: ['Comprar imóvel', 'Alugar imóvel', 'Ver todos os imóveis'],
      };
    }

    const nextCtx = { ...context };
    let updatedSomething = false;

    if (norm.includes('alug') || norm.includes('locac')) {
      nextCtx.finalidade = 'LOCACAO';
      updatedSomething = true;
    } else if (norm.includes('compr') || norm.includes('venda')) {
      nextCtx.finalidade = 'VENDA';
      updatedSomething = true;
    }

    if (norm.includes('apartamento') || norm.includes('apto') || /\bap\b/.test(norm)) {
      nextCtx.tipo = 'apartamento';
      updatedSomething = true;
    } else if (norm.includes('casa') || norm.includes('sobrado')) {
      nextCtx.tipo = 'casa';
      updatedSomething = true;
    }

    const bedroomsMatch = norm.match(/(\d+)\s*(?:quarto|dormitorio|suite)/);
    if (bedroomsMatch) {
      nextCtx.quartos = Number(bedroomsMatch[1]);
      updatedSomething = true;
    }

    const budget = extractMaxBudget(norm);
    if (budget !== null) {
      nextCtx.orcamentoMax = budget;
      updatedSomething = true;
    }

    const knownLocations = Array.from(
      new Set(
        properties.flatMap((p) => [normalizeText(p.bairro), normalizeText(p.cidade)]).filter(Boolean)
      )
    );
    const matchedLocation = knownLocations.find((loc) => loc.length > 2 && norm.includes(loc));
    if (matchedLocation) {
      nextCtx.localizacao = matchedLocation;
      updatedSomething = true;
    }

    setContext(nextCtx);

    if (
      norm.includes('todos') ||
      norm.includes('destaques') ||
      norm.includes('catalogo') ||
      norm.includes('novos') ||
      norm.includes('recentes')
    ) {
      const disponiveis = properties.filter((p) => p.status === 'DISPONIVEL');
      if (disponiveis.length > 0) {
        setContext((prev) => ({ ...prev, ultimoImovelFocado: disponiveis[0] }));
      }
      return {
        text: `Separei os principais destaques disponíveis na nossa carteira neste momento (incluindo os cadastros mais recentes). Dê uma olhada e me diga se algum faz o seu estilo — posso te passar mais detalhes ou agendar uma visita:`,
        recommended: disponiveis.slice(0, 3),
        quickReplies: ['Filtrar por apartamento', 'Filtrar por casa', 'Como funciona o financiamento?'],
      };
    }

    if (
      /^(oi|ola|bom dia|boa tarde|boa noite|tudo bem|ei)\b/.test(norm) &&
      !updatedSomething
    ) {
      return {
        text: `Olá, ${firstName}! Tudo excelente por aqui. Para eu ser bem assertiva na minha consultoria e não te mostrar opções fora do seu perfil, me conta: você prefere **casa** ou **apartamento**, e tem algum bairro de preferência?`,
        recommended: [],
        quickReplies: ['Prefiro apartamento', 'Prefiro casa', 'Ver destaques disponíveis'],
      };
    }

    const onlyPurposeSet =
      nextCtx.finalidade &&
      !nextCtx.tipo &&
      !nextCtx.localizacao &&
      !nextCtx.quartos &&
      !nextCtx.orcamentoMax;

    if (onlyPurposeSet) {
      const byPurpose = properties.filter(
        (p) => p.finalidade === nextCtx.finalidade && p.status === 'DISPONIVEL'
      );
      const label = nextCtx.finalidade === 'LOCACAO' ? 'locação' : 'compra';
      return {
        text: `Perfeito, vamos focar em opções para **${label}**! Para eu afinar ainda mais a busca para você:\n\n• Você prefere **apartamento** ou **casa**?\n• Quantos **quartos** seriam ideais?\n• Qual **bairro** ou faixa de valor você prioriza?\n\nEnquanto me responde, já separei ${byPurpose.slice(0, 2).length} opções disponíveis para você ter uma referência:`,
        recommended: byPurpose.slice(0, 2),
        quickReplies: [
          'Apartamento com 2 quartos',
          'Casa com quintal',
          'Recomeçar busca',
        ],
      };
    }

    let matches = [...properties];

    if (nextCtx.finalidade) {
      matches = matches.filter((p) => p.finalidade === nextCtx.finalidade);
    }
    if (nextCtx.tipo) {
      matches = matches.filter((p) => normalizeText(p.tipo) === nextCtx.tipo);
    }
    if (nextCtx.localizacao) {
      matches = matches.filter(
        (p) =>
          normalizeText(p.bairro).includes(nextCtx.localizacao) ||
          normalizeText(p.cidade).includes(nextCtx.localizacao)
      );
    }
    if (nextCtx.quartos !== null) {
      matches = matches.filter((p) => Number(p.quartos) >= nextCtx.quartos);
    }
    if (nextCtx.orcamentoMax !== null) {
      matches = matches.filter((p) => Number(p.preco) <= nextCtx.orcamentoMax);
    }

    if (!updatedSomething) {
      const keywords = norm.split(/\s+/).filter((w) => w.length > 3);
      matches = properties.filter((p) => {
        const blob = normalizeText(`${p.titulo} ${p.bairro} ${p.cidade} ${p.descricao} ${p.codigo}`);
        return keywords.some((kw) => blob.includes(kw));
      });
    }

    if (matches.length > 0) {
      setContext((prev) => ({ ...prev, ultimoImovelFocado: matches[0] }));

      const summaryParts = [];
      if (nextCtx.finalidade) summaryParts.push(nextCtx.finalidade === 'LOCACAO' ? 'locação' : 'compra');
      if (nextCtx.tipo) summaryParts.push(nextCtx.tipo);
      if (nextCtx.localizacao) summaryParts.push(`bairro/região ${nextCtx.localizacao}`);
      if (nextCtx.quartos) summaryParts.push(`${nextCtx.quartos}+ quartos`);
      if (nextCtx.orcamentoMax) summaryParts.push(`até ${currency.format(nextCtx.orcamentoMax)}`);

      const criterioTxt = summaryParts.length
        ? `considerando **${summaryParts.join(', ')}**`
        : 'com base no que você descreveu';

      return {
        text: `Analisei nossa carteira ${criterioTxt} e selecionei ${matches.length} ${matches.length === 1 ? 'opção excelente' : 'opções excelentes'} para o seu perfil.\n\nVocê pode clicar no imóvel para ver todas as fotos e detalhes, ou solicitar uma visita agora mesmo:`,
        recommended: matches,
        quickReplies: [
          'Como funciona o financiamento?',
          'Quais documentos preciso?',
          'Recomeçar busca',
        ],
      };
    }

    const alternatives = properties
      .filter((p) => (nextCtx.finalidade ? p.finalidade === nextCtx.finalidade : true))
      .slice(0, 2);

    return {
      text: `Fui sincera na busca: com todos esses critérios juntos não temos nenhum imóvel disponível agora na carteira.\n\nComo consultora, sugiro flexibilizarmos o bairro ou a faixa de valor. Dê uma olhada nessas alternativas próximas que podem te surpreender — ou me diga qual critério prefere ajustar:`,
      recommended: alternatives,
      quickReplies: [
        'Ver todos os imóveis disponíveis',
        'Recomeçar busca',
        'Falar sobre financiamento',
      ],
    };
  }

  function submitMessage(textToSend) {
    const clean = (textToSend || '').trim();
    if (!clean || isTyping) return;

    setMessages((prev) => [...prev, { sender: 'user', text: clean }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = buildConsultativeReply(clean);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply.text,
          recommended: reply.recommended || [],
          quickReplies: reply.quickReplies || [],
        },
      ]);
      setIsTyping(false);
    }, 650);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <div className="ai-chat-container">
      <section className="page-heading chat-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> CONSULTORIA IMOBILIÁRIA INTELIGENTE
          </span>
          <h1>Clara · Consultora Morada</h1>
          <p className="page-subtitle">
            Atendimento personalizado com acesso em tempo real aos {properties.length} imóveis da carteira.
          </p>
        </div>
      </section>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className="chat-turn-group">
              <div
                className={`chat-bubble-wrapper ${msg.sender === 'ai' ? 'wrapper-ai' : 'wrapper-user'}`}
              >
                <div
                  className={`chat-avatar ${msg.sender === 'user' ? 'user-chat-avatar' : ''}`}
                  title={msg.sender === 'ai' ? 'Clara - Consultora IA' : userName}
                >
                  {msg.sender === 'ai' ? <Sparkles size={16} /> : <span>{userInitials}</span>}
                </div>

                <div className={`chat-bubble ${msg.sender === 'ai' ? 'bubble-ai' : 'bubble-user'}`}>
                  <div className="chat-sender-tag">
                    {msg.sender === 'ai' ? 'Clara · Consultora Morada' : userName}
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    {renderFormattedText(msg.text)}
                  </p>

                  {msg.recommended && msg.recommended.length > 0 && (
                    <div className="chat-recommendations-list">
                      {msg.recommended.map((prop) => {
                        const alreadyScheduled = scheduledIds.includes(prop.id);
                        return (
                          <div key={prop.id} className="chat-property-card-wrap">
                            <div
                              className="chat-property-card"
                              onClick={() => onOpenProperty && onOpenProperty(prop)}
                            >
                              <img src={prop.imagem} alt={prop.titulo} />
                              <div className="chat-property-info">
                                <div className="chat-property-header">
                                  <strong>{prop.titulo}</strong>
                                  <span className="chat-prop-badge">
                                    {prop.finalidade === 'LOCACAO' ? 'Locação' : 'Venda'}
                                  </span>
                                </div>
                                <small>
                                  {prop.bairro} · {prop.cidade} ({prop.codigo})
                                </small>
                                <div className="chat-property-meta">
                                  <span>
                                    <Tag size={11} /> {prop.area} m²
                                  </span>
                                  <span>
                                    <BedDouble size={12} /> {prop.quartos} qts
                                  </span>
                                  <strong className="chat-prop-price">
                                    {currency.format(prop.preco)}
                                    {prop.finalidade === 'LOCACAO' ? '/mês' : ''}
                                  </strong>
                                </div>
                              </div>
                              <ArrowUpRight size={16} className="chat-card-arrow" />
                            </div>

                            <button
                              type="button"
                              className={`chat-schedule-btn ${alreadyScheduled ? 'scheduled' : ''}`}
                              onClick={() => handleScheduleVisit(prop)}
                              disabled={alreadyScheduled}
                            >
                              {alreadyScheduled ? (
                                <>
                                  <CheckCircle2 size={13} /> Visita solicitada ao corretor
                                </>
                              ) : (
                                <>
                                  <CalendarCheck size={13} /> Agendar visita com corretor
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {msg.sender === 'ai' &&
                idx === messages.length - 1 &&
                msg.quickReplies &&
                msg.quickReplies.length > 0 &&
                !isTyping && (
                  <div className="chat-quick-replies">
                    {msg.quickReplies.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="quick-reply-pill"
                        onClick={() => submitMessage(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-wrapper wrapper-ai">
              <div className="chat-avatar">
                <Sparkles size={16} />
              </div>
              <div className="chat-bubble bubble-ai typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleFormSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Converse com a Clara (ex: Quero comprar um apto no Cambuí, ou tirar dúvidas de financiamento)..."
            aria-label="Mensagem para a consultora"
          />
          <button type="submit" className="button button-dark" disabled={!input.trim() || isTyping}>
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}