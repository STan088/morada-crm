import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
});
const compactCurrency = (value) => currency.format(value || 0);

export function AiChatWorkspace({ properties, onOpenProperty }) {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Olá! Sou o Assistente IA da Morada. O que você procura no seu próximo imóvel?\n\nPara eu encontrar a opção perfeita, me informe:\n📍 Bairro desejado\n🛏️ Quantidade de quartos\n📏 Tamanho ideal (m²)' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const cleanInput = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim();
      
      // Instrução clara para contato direto
      if (cleanInput.match(/(contato|falar|corretor|atendimento|visita|comprar|alugar|proposta|telefone|whatsapp|como faco|interesse)/)) {
        setMessages((prev) => [...prev, { 
          sender: 'ai', 
          text: 'Para entrar em contato conosco é muito fácil! \n\n👉 Basta **clicar em cima do imóvel** que você gostou no catálogo ou aqui no chat e, em seguida, clicar no botão verde **"Tenho interesse"**. Preencha seus dados rápidos e um corretor vai te chamar na hora!' 
        }]);
        setIsTyping(false);
        return;
      }

      if (cleanInput.match(/^(oi|ola|bom dia|boa tarde|boa noite|tudo bem|opa)$/)) {
        setMessages((prev) => [...prev, { 
          sender: 'ai', 
          text: 'Olá! Tudo ótimo. Me diga qual bairro ou quantidade exata de quartos você procura para eu buscar no nosso catálogo restrito!' 
        }]);
        setIsTyping(false);
        return;
      }

      let textToAnalyze = cleanInput;
      const isAskingForAnother = cleanInput.match(/(outra|outro|outras|outros|mais|diferente|proxima|proximo)/);
      
      if (isAskingForAnother) {
        const pastUserMessages = messages.filter(m => m.sender === 'user');
        const lastMeaningful = pastUserMessages.reverse().find(m => {
            const mClean = m.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim();
            return !mClean.match(/^(outra|outro|outras|outros|mais|diferente|proxima|proximo)$/);
        });
        if (lastMeaningful) {
            textToAnalyze += " " + lastMeaningful.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
      }

      const suggestedIds = messages.filter(m => m.property).map(m => m.property.id);

      // FILTRO ABSOLUTO DE BAIRRO E QUARTOS
      const knownBairros = [...new Set(properties.map(p => p.bairro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))];
      const reqBairro = knownBairros.find(b => textToAnalyze.includes(b));
      const quartosMatch = textToAnalyze.match(/(\d+)\s*(quarto|quartos|dormitorio|dormitorios|dorm)/);
      const reqQuartos = quartosMatch ? parseInt(quartosMatch[1]) : null;

      let candidateProperties = properties;

      // Se o usuário pediu um bairro ou quartos específicos, elimina tudo que for diferente
      if (reqBairro) {
        candidateProperties = candidateProperties.filter(p => p.bairro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === reqBairro);
      }
      if (reqQuartos !== null) {
        candidateProperties = candidateProperties.filter(p => p.quartos === reqQuartos);
      }

      // Pontua apenas as propriedades que sobreviveram ao filtro restrito
      let bestMatch = null;
      let maxScore = -999; 

      candidateProperties.forEach(p => {
        let score = 0;
        const tituloNorm = p.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (textToAnalyze.match(/(apartamento|apto|ap)/) && (p.tipo === 'APARTAMENTO' || tituloNorm.includes('apartamento'))) score += 5;
        if (textToAnalyze.match(/(casa|sobrado)/) && (p.tipo === 'CASA' || tituloNorm.includes('casa'))) score += 5;
        if (textToAnalyze.match(/(alugar|aluguel|locacao)/) && p.finalidade === 'LOCACAO') score += 5;
        if (textToAnalyze.match(/(comprar|compra|venda)/) && p.finalidade === 'VENDA') score += 5;

        // Penalidade severa para evitar repetição do mesmo imóvel
        if (suggestedIds.includes(p.id)) {
            score -= 50; 
        }

        if (score > maxScore) {
            maxScore = score;
            bestMatch = p;
        }
      });

      let aiReply = '';
      let suggestedProperty = null;

      if (candidateProperties.length > 0 && bestMatch && maxScore > -50) {
        const formatacaoImovel = `\n\n📍 Bairro: ${bestMatch.bairro}\n🛏️ Quartos: ${bestMatch.quartos} dormitórios\n📏 Tamanho: ${bestMatch.area} m²\n💰 Valor: ${compactCurrency(bestMatch.preco)}\n\n*Dica: Clique no imóvel abaixo e depois em "Tenho interesse" para preencher seus dados!*`;

        aiReply = isAskingForAnother 
          ? `Tenho esta outra opção disponível que atende exatamente ao seu pedido:${formatacaoImovel}`
          : `Encontrei exatamente o que você pediu! Veja os detalhes:${formatacaoImovel}`;
          
        suggestedProperty = bestMatch;
      } else if (isAskingForAnother) {
        aiReply = "As opções exatas com esse perfil acabaram no nosso catálogo atual. Tente alterar o bairro ou flexibilizar o número de quartos.";
      } else {
        const constraints = [];
        if (reqBairro) constraints.push(`no bairro ${reqBairro.toUpperCase()}`);
        if (reqQuartos !== null) constraints.push(`com ${reqQuartos} quarto(s)`);
        
        if (constraints.length > 0) {
          aiReply = `Puxa, atualmente não temos nenhum imóvel ${constraints.join(' e ')} na nossa base de dados. Poderia tentar buscar em um bairro vizinho ou mudar a quantidade de quartos?`;
        } else {
          aiReply = "Não consegui extrair os dados precisos da sua mensagem. Poderia me informar novamente o **bairro** desejado e a **quantidade de quartos**?";
        }
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply, property: suggestedProperty }]);
      setIsTyping(false);
    }, 1200); 
  }

  return (
    <div className="ai-chat-container">
      <section className="page-heading chat-heading">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> SUPORTE INTELIGENTE</p>
          <h1>Assistente IA</h1>
          <p className="page-subtitle">Tire dúvidas, peça imóveis exatos ou saiba como entrar em contato.</p>
        </div>
      </section>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
              {msg.sender === 'ai' && <div className="chat-avatar"><Sparkles size={16} /></div>}
              <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
                {msg.property && (
                  <div className="chat-property-card" onClick={() => onOpenProperty(msg.property)}>
                    <img src={msg.property.imagem} alt={msg.property.titulo} />
                    <div className="chat-property-info">
                      <strong>{msg.property.titulo}</strong>
                      <span>{compactCurrency(msg.property.preco)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-wrapper wrapper-ai">
              <div className="chat-avatar"><Sparkles size={16} /></div>
              <div className="chat-bubble bubble-ai typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ex: Quero um apartamento de 3 quartos no Cambuí..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            disabled={isTyping}
            autoFocus
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="button button-dark">
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}