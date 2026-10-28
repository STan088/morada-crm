import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp, ArrowRight, ArrowUpRight, Bell, BedDouble, BriefcaseBusiness,
  Building2, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight,
  CircleHelp, ClipboardList, Clock3, Eye, EyeOff, Filter, Heart, House,
  LayoutDashboard, ListFilter, LockKeyhole, LogOut, Mail, Menu, MessageCircle,
  MoreHorizontal, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles,
  Sprout, Tag, Users, X,
} from 'lucide-react';

const API = 'http://localhost:8080/api';
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
});
const compactCurrency = (value) => currency.format(value || 0);
const initialDeals = [
  { id: 'pa', initials: 'PA', name: 'Pedro Alves', property: 'Apartamento em Cambuí · IM-021', amount: 'R$ 930.000', stage: 'Contraproposta', progress: 3, tone: 'lilac' },
  { id: 'rf', initials: 'RF', name: 'Rafael Ferreira', property: 'Casa no Parque Prado · IM-011', amount: 'R$ 720.000', stage: 'Documentação', progress: 4, tone: 'mint' },
  { id: 'as', initials: 'AS', name: 'Ana Souza', property: 'Apartamento com varanda · IM-014', amount: 'R$ 760.000', stage: 'Primeiro contato', progress: 1, tone: 'coral' },
];

function App() {
  const [enteredProfile, setEnteredProfile] = useState(null);
  const [loginProfile, setLoginProfile] = useState('cliente');

  if (!enteredProfile) {
    return <LoginPage initialProfile={loginProfile} onEnter={(profile) => {
      setLoginProfile(profile);
      setEnteredProfile(profile);
    }} />;
  }

  return <CrmWorkspace initialProfile={enteredProfile} onLogout={() => setEnteredProfile(null)} />;
}

function LoginPage({ initialProfile, onEnter }) {
  const [profile, setProfile] = useState(initialProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');

  const client = profile === 'cliente';

  function submitLogin(event) {
    event.preventDefault();
    setHelpMessage('');
    onEnter(profile);
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand login-brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><House size={19} strokeWidth={1.8} /></span>
          <span>morada</span>
        </a>
        <button className="login-help" onClick={() => setHelpMessage('Precisa de ajuda? Fale com a Imobiliária Horizonte para receber suporte ao seu acesso.')}>
          <CircleHelp size={16} /> Precisa de ajuda?
        </button>
      </header>

      <div className="login-layout">
        <section className="login-story">
          <div className="story-copy">
            <span className="story-eyebrow">
              {client ? <Users size={15} /> : <BriefcaseBusiness size={15} />}
              {client ? 'PORTAL DO CLIENTE' : 'ESPAÇO DE TRABALHO'}
            </span>
            <h1>{client ? <>Seu próximo lar,<br />mais perto de você.</> : <>Mais tempo para<br />conectar pessoas.</>}</h1>
            <p>{client
              ? 'Um espaço para acompanhar cada passo da sua jornada com a Imobiliária Horizonte.'
              : 'Sua carteira organizada e cada contato no radar. Um dia a dia mais simples para fazer bons negócios.'}</p>
          </div>
          <div className="story-photo-card">
            <img
              src={client
                ? 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85'
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'}
              alt={client ? 'Sala de estar aconchegante e iluminada' : 'Casa contemporânea cercada por jardim'}
            />
            <div className="story-photo-caption">
              <span className="story-caption-icon">{client ? <House size={19} /> : <Sprout size={19} />}</span>
              <span>
                <strong>{client ? 'Do primeiro interesse à chave na mão.' : 'O próximo bom negócio começa aqui.'}</strong>
                <small>{client ? 'Seus imóveis, visitas e propostas em um só lugar.' : 'Imóveis, clientes e negociações sempre à mão.'}</small>
              </span>
            </div>
          </div>
          <div className="story-footer">
            {client ? <MessageCircle size={17} /> : <BriefcaseBusiness size={17} />}
            <span>{client ? 'Seu corretor por perto, em cada nova etapa.' : 'Menos tarefas soltas. Mais boas conversas.'}</span>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-tabs" role="tablist" aria-label="Tipo de acesso">
            <button
              className={client ? 'selected' : ''}
              role="tab"
              aria-selected={client}
              onClick={() => { setProfile('cliente'); setHelpMessage(''); }}
            >
              <Users size={16} /> Sou cliente
            </button>
            <button
              className={!client ? 'selected' : ''}
              role="tab"
              aria-selected={!client}
              onClick={() => { setProfile('corretor'); setHelpMessage(''); }}
            >
              <BriefcaseBusiness size={16} /> Sou corretor
            </button>
          </div>
          <div className="login-company"><Building2 size={15} /> Imobiliária Horizonte</div>
          <h2>{client ? 'Acesse a área do cliente' : 'Acesse a área do corretor'}</h2>
          <p className="login-description">{client
            ? 'Entre para acompanhar seus imóveis, visitas e propostas.'
            : 'Entre para cuidar dos seus clientes e próximos negócios.'}</p>
          <form className="login-form" onSubmit={submitLogin}>
            <label className="login-field-label" htmlFor="login-email">{client ? 'E-mail' : 'E-mail profissional'}</label>
            <div className="login-input-wrap">
              <Mail size={18} />
              <input id="login-email" name="email" type="email" placeholder={client ? 'Digite seu e-mail' : 'voce@imobiliaria.com.br'} required autoComplete="email" />
            </div>
            {client && <>
              <label className="login-field-label" htmlFor="login-password">Senha</label>
              <div className="login-input-wrap">
                <LockKeyhole size={18} />
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" required autoComplete="current-password" />
                <button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="login-options">
                <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Lembrar de mim</span></label>
                <button type="button" className="login-inline-link" onClick={() => setHelpMessage('Para redefinir sua senha, solicite um link à equipe da Imobiliária Horizonte.')}>Esqueci minha senha</button>
              </div>
            </>}
            <button className="login-submit" type="submit">
              {client ? 'Entrar na área do cliente' : 'Entrar no CRM'} <ArrowRight size={17} />
            </button>
          </form>
          <p className="demo-disclaimer">Acesso demonstrativo. A autenticação real ainda não está conectada.</p>
          <div className="first-access-card">
            <strong>É seu primeiro acesso?</strong>
            <p>{client
              ? 'Peça seu convite ao corretor da Imobiliária Horizonte.'
              : 'Solicite seu acesso ao administrador da imobiliária.'}</p>
            <button className="first-access-link" onClick={() => setHelpMessage(client
              ? 'Entre em contato com seu corretor para receber o convite do portal.'
              : 'Entre em contato com o administrador da imobiliária para solicitar seu acesso.')}>
              {client ? 'Falar com a imobiliária' : 'Falar com o administrador'} <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="secure-note"><ShieldCheck size={15} /> Ambiente demonstrativo do CRM.</div>
          {helpMessage && <div className="login-help-message" role="status"><span>{helpMessage}</span><button onClick={() => setHelpMessage('')} aria-label="Fechar"><X size={15} /></button></div>}
        </section>
      </div>
    </main>
  );
}

function CrmWorkspace({ initialProfile, onLogout }) {
  const [profile, setProfile] = useState(initialProfile);
  const [section, setSection] = useState(initialProfile === 'corretor' ? 'Visão geral' : 'Explorar imóveis');
  const [properties, setProperties] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState(initialDeals);
  const [activeDealCount, setActiveDealCount] = useState(6);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [leadProperty, setLeadProperty] = useState(null);
  const [leadError, setLeadError] = useState('');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('busca', search.trim());
    if (type) params.set('tipo', type);
    if (purpose) params.set('finalidade', purpose);
    return params.toString();
  }, [search, type, purpose]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API}/imoveis${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error('A API não conseguiu carregar os imóveis. Tente novamente.');
        const propertyData = await response.json();
        if (active) setProperties(propertyData);
      } catch {
        if (active) setError('Não foi possível carregar os imóveis. Verifique se a API Java está online.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    let active = true;
    if (profile !== 'corretor') {
      setDashboard(null);
      setLeads([]);
      return () => { active = false; };
    }
    const loadWorkspace = async () => {
      try {
        const [dashboardResponse, leadsResponse] = await Promise.all([
          fetch(`${API}/dashboard`),
          fetch(`${API}/leads`),
        ]);
        if (!dashboardResponse.ok || !leadsResponse.ok) {
          throw new Error('A API não conseguiu carregar os dados do corretor.');
        }
        const [dashboardData, leadsData] = await Promise.all([
          dashboardResponse.json(), leadsResponse.json(),
        ]);
        if (active) {
          setDashboard(dashboardData);
          setLeads(leadsData);
        }
      } catch {
        if (active) setError('Não foi possível carregar os dados do corretor. Verifique se a API Java está online.');
      }
    };
    loadWorkspace();
    return () => { active = false; };
  }, [profile]);

  async function submitLead(formData) {
    setNotice('');
    setLeadError('');
    setError('');
    try {
      const response = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          imovelId: leadProperty?.id ?? null,
          mensagem: formData.get('mensagem'),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.message || 'Não foi possível enviar a solicitação.');
      setNotice('Solicitação enviada. Um corretor entrará em contato.');
      setLeads((previous) => [result, ...previous]);
      setLeadProperty(null);
      setDashboard((previous) => previous
        ? { ...previous, novosLeads: previous.novosLeads + 1 }
        : previous);
    } catch (submissionError) {
      const message = submissionError.message || 'Falha ao enviar. Confira se a API Java está online.';
      setLeadError(message);
      setError(message);
    }
  }

  async function submitContact(formData) {
    setContactError('');
    setContactSaving(true);
    try {
      const propertyId = formData.get('imovelId');
      const response = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          imovelId: propertyId ? Number(propertyId) : null,
          mensagem: formData.get('mensagem'),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || result.message || 'Não foi possível adicionar o contato.');
      }
      setLeads((previous) => [result, ...previous]);
      setDashboard((previous) => previous
        ? { ...previous, novosLeads: previous.novosLeads + 1 }
        : previous);
      setContactDialogOpen(false);
      setNotice('Contato adicionado com sucesso.');
    } catch (submissionError) {
      setContactError(submissionError.message || 'Falha ao adicionar contato. Verifique se a API está online.');
    } finally {
      setContactSaving(false);
    }
  }

  function addDeal(deal) {
    setDeals((previous) => [deal, ...previous]);
    setActiveDealCount((previous) => previous + 1);
  }

  function toggleFavorite(id) {
    setFavoriteIds((current) => current.includes(id)
      ? current.filter((favorite) => favorite !== id)
      : [...current, id]);
  }

  function chooseSection(name) {
    setSection(name);
    setMobileMenu(false);
    setSearch('');
    setType('');
    setPurpose('');
  }

  const navItems = profile === 'corretor'
    ? [
      { name: 'Visão geral', icon: LayoutDashboard },
      { name: 'Imóveis', icon: House },
      { name: 'Meus contatos', icon: MessageCircle },
      { name: 'Negociações', icon: ClipboardList },
    ]
    : [
      { name: 'Explorar imóveis', icon: House },
      { name: 'Favoritos', icon: Heart },
    ];

  const filteredProperties = section === 'Favoritos'
    ? properties.filter((property) => favoriteIds.includes(property.id))
    : properties;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); chooseSection(profile === 'corretor' ? 'Visão geral' : 'Explorar imóveis'); }}>
          <span className="brand-mark"><House size={19} strokeWidth={1.8} /></span>
          <span>morada</span>
        </a>

        <div className="workspace-card">
          <span className="workspace-icon"><Building2 size={19} /></span>
          <span className="workspace-copy">
            <strong>{profile === 'corretor' ? 'Imobiliária Horizonte' : 'Meu espaço'}</strong>
            <small>{profile === 'corretor' ? 'Seu espaço de trabalho' : 'Área do cliente'}</small>
          </span>
        </div>

        <div className="sidebar-label">{profile === 'corretor' ? 'ESPAÇO DE TRABALHO' : 'MINHA CONTA'}</div>
        <nav className="side-nav">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${section === name ? 'active' : ''}`} onClick={() => chooseSection(name)}>
              <Icon size={19} strokeWidth={1.7} />
              <span>{name}</span>
              {name === 'Meus contatos' && dashboard?.novosLeads > 0 && <span className="nav-count">{dashboard.novosLeads}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <Sprout size={23} strokeWidth={1.6} />
            <strong>Mais tempo para conectar.</strong>
            <span>Seu próximo bom negócio começa aqui.</span>
          </div>
          <button className="help-link"><CircleHelp size={17} /> Central de ajuda</button>
          <div className="profile-row">
            <div className="avatar">{profile === 'corretor' ? 'MC' : 'MA'}</div>
            <span><strong>{profile === 'corretor' ? 'Marina Costa' : 'Marina Almeida'}</strong><small>{profile === 'corretor' ? 'Corretora · CRECI 123456' : 'Cliente'}</small></span>
            <button className="logout-button" onClick={onLogout} aria-label="Sair da demonstração" title="Sair da demonstração"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-backdrop" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Área de trabalho</span><ChevronRight size={15} /><strong>{section}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /><span /></button>
            <div className="avatar avatar-small">{profile === 'corretor' ? 'MC' : 'MA'}</div>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="alert alert-error"><span>{error}</span><button onClick={() => window.location.reload()}>Tentar novamente</button></div>}
          {notice && <div className="alert alert-success"><Check size={17} /> {notice}<button onClick={() => setNotice('')} aria-label="Fechar"><X size={16} /></button></div>}

          {profile === 'corretor' && section === 'Visão geral' && (
            <BrokerDashboard
              dashboard={dashboard}
              leads={leads}
              properties={properties}
              loading={loading}
              onSection={chooseSection}
              onOpenProperty={setSelectedProperty}
            />
          )}

          {((profile === 'corretor' && section === 'Imóveis')
            || (profile === 'cliente' && ['Explorar imóveis', 'Favoritos'].includes(section))) && (
            <PropertyCatalog
              profile={profile}
              section={section}
              properties={filteredProperties}
              search={search}
              type={type}
              purpose={purpose}
              favoriteIds={favoriteIds}
              loading={loading}
              onSearch={setSearch}
              onType={setType}
              onPurpose={setPurpose}
              onFavorite={toggleFavorite}
              onOpenProperty={setSelectedProperty}
              onLead={setLeadProperty}
            />
          )}

          {profile === 'corretor' && section === 'Meus contatos' && (
            <LeadWorkspace
              dashboard={dashboard}
              leads={leads}
              onShowProperties={() => chooseSection('Imóveis')}
              onAddContact={() => { setContactError(''); setContactDialogOpen(true); }}
            />
          )}
          {profile === 'corretor' && section === 'Negociações' && (
            <DealWorkspace
              properties={properties}
              deals={deals}
              activeDealCount={activeDealCount}
              onCreateDeal={addDeal}
            />
          )}
        </div>
      </main>

      {selectedProperty && (
        <PropertyDialog
          property={selectedProperty}
          profile={profile}
          favorite={favoriteIds.includes(selectedProperty.id)}
          onClose={() => setSelectedProperty(null)}
          onFavorite={() => toggleFavorite(selectedProperty.id)}
          onLead={() => { setLeadProperty(selectedProperty); setSelectedProperty(null); }}
        />
      )}
      {leadProperty && <LeadDialog property={leadProperty} errorMessage={leadError} onClose={() => { setLeadProperty(null); setLeadError(''); }} onSubmit={submitLead} />}
      {contactDialogOpen && (
        <ContactDialog
          properties={properties}
          errorMessage={contactError}
          saving={contactSaving}
          onClose={() => setContactDialogOpen(false)}
          onSubmit={submitContact}
        />
      )}
    </div>
  );
}

function BrokerDashboard({ dashboard, leads = [], properties, loading, onSection, onOpenProperty }) {
  const [taskList, setTaskList] = useState([]);
  const [taskView, setTaskView] = useState('pending');
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState('');
  useEffect(() => setTaskList(dashboard?.tarefas || []), [dashboard?.tarefas]);
  const activeTasks = taskList.filter((task) => !task.concluida);
  const completedTasks = taskList.filter((task) => task.concluida);
  const visibleTasks = taskView === 'pending' ? activeTasks : completedTasks;
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date()).toLocaleUpperCase('pt-BR');

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTaskList((current) => [...current, {
      id: Date.now(),
      titulo: newTask.trim(),
      descricao: 'Adicionada agora',
      concluida: false,
    }]);
    setNewTask('');
    setAddingTask(false);
  }

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">{today}</p><h1>Bom dia, Marina <span className="greeting-sun">✳</span></h1>
          <p className="page-subtitle">Vamos encontrar o próximo lar de alguém? Veja como está seu dia.</p></div>
        <button className="button button-dark" onClick={() => onSection('Imóveis')}><House size={16} /> Ver imóveis</button>
      </section>
      <section className="metric-grid">
        <MetricCard icon={House} label="Imóveis disponíveis" value={loading ? '—' : dashboard?.imoveisDisponiveis ?? 0} detail={`${dashboard?.imoveisNaCarteira ?? '—'} imóveis na carteira`} />
        <MetricCard icon={Users} label="Novos leads" value={loading ? '—' : dashboard?.novosLeads ?? 0} detail="Desde o início do dia" tone="mint" />
        <MetricCard icon={ClipboardList} label="Tarefas pendentes" value={loading ? '—' : activeTasks.length} detail={`${activeTasks.length} para hoje`} tone="sand" />
      </section>
      <div className="dashboard-grid">
        <section className="panel task-panel">
          <div className="panel-heading"><div><h2>Suas tarefas de hoje</h2><p>Pequenos passos, grandes encontros.</p></div><button className="text-button">Ver agenda <ArrowRight size={15} /></button></div>
          <div className="task-tabs">
            <button className={taskView === 'pending' ? 'tab-active' : ''} onClick={() => setTaskView('pending')}>Pendentes <b>{activeTasks.length}</b></button>
            <button className={taskView === 'completed' ? 'tab-active' : ''} onClick={() => setTaskView('completed')}>Concluídas <b>{completedTasks.length}</b></button>
          </div>
          <div className="task-list">
            {visibleTasks.map((task) => (
              <label key={task.id} className={`task-row ${task.concluida ? 'task-done' : ''}`}>
                <input type="checkbox" checked={task.concluida} onChange={() => setTaskList((current) => current.map((item) => item.id === task.id ? { ...item, concluida: !item.concluida } : item))} />
                <span className="custom-checkbox"><Check size={13} /></span>
                <span className="task-copy"><strong>{task.titulo}</strong><small>{task.descricao}</small></span>
                <MoreHorizontal size={18} className="muted task-more" />
              </label>
            ))}
            {!visibleTasks.length && !loading && <EmptyState icon={CheckCheck} title={taskView === 'pending' ? 'Tudo em dia' : 'Nenhuma tarefa concluída'} text={taskView === 'pending' ? 'Suas tarefas aparecerão aqui.' : 'As tarefas concluídas ficam reunidas aqui.'} />}
          </div>
          {addingTask
            ? <form className="add-task-form" onSubmit={addTask}><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Descreva a nova tarefa" aria-label="Nova tarefa" /><button type="submit">Salvar</button><button type="button" onClick={() => { setAddingTask(false); setNewTask(''); }}>Cancelar</button></form>
            : <button className="add-task" onClick={() => setAddingTask(true)}><Plus size={16} /> Adicionar tarefa</button>}
        </section>
        <aside className="right-column">
          <section className="panel lead-summary">
            <div className="panel-heading"><div><h2>Leads recentes</h2><p>Novas pessoas procurando um lar.</p></div><button className="icon-button"><ArrowUpRight size={17} /></button></div>
            {leads.slice(0, 2).map((lead, index) => <div key={lead.id} className="lead-person"><div className={`avatar lead-avatar ${index ? 'lilac' : 'coral'}`}>{lead.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><span><strong>{lead.nome}</strong><small>{lead.interesse}</small></span><span className="lead-time">{lead.data}</span></div>)}
            {!leads.length && <EmptyState icon={Users} title="Nenhum lead por enquanto" text="As solicitações de contato aparecerão aqui." />}
            <button className="text-button full-width" onClick={() => onSection('Meus contatos')}>Ver todos os leads <ArrowRight size={15} /></button>
          </section>
          <section className="inspiration-card">
            <div className="inspiration-icon"><Sparkles size={18} /></div>
            <span className="eyebrow">SUGESTÃO PARA VOCÊ</span>
            <h3>Um imóvel certo muda tudo.</h3>
            <p>Confira os imóveis que acabaram de chegar à sua carteira.</p>
            <button className="text-button" onClick={() => onSection('Imóveis')}>Explorar imóveis <ArrowRight size={15} /></button>
          </section>
        </aside>
      </div>
      <section className="section-block">
        <div className="section-title-row"><div><p className="eyebrow">SUA CARTEIRA</p><h2>Imóveis em destaque</h2></div><button className="text-button" onClick={() => onSection('Imóveis')}>Ver carteira <ArrowRight size={15} /></button></div>
        <div className="property-grid dashboard-properties">{properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} onOpen={() => onOpenProperty(property)} />)}</div>
      </section>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = '' }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><Icon size={19} strokeWidth={1.7} /></div><strong>{value}</strong><small>{detail}</small></article>;
}

function PropertyCatalog({ profile, section, properties, search, type, purpose, favoriteIds, loading, onSearch, onType, onPurpose, onFavorite, onOpenProperty, onLead }) {
  const client = profile === 'cliente';
  return (
    <>
      <section className={`catalog-heading ${client ? 'client-heading' : ''}`}>
        {client && <div className="catalog-welcome"><span className="eyebrow"><Sparkles size={14} /> UM LUGAR PARA CHAMAR DE SEU</span><h1>Seu próximo capítulo<br />começa em casa.</h1><p>Encontre um espaço com a sua cara, no seu tempo.</p></div>}
        {!client && <div><h1>Imóveis</h1><p className="page-subtitle">Sua carteira organizada. O imóvel certo, sempre à mão.</p></div>}
        {client && <div className="client-hero-image"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" alt="Sala de estar iluminada com vista para a cidade" /></div>}
      </section>
      <div className="catalog-counts">
        <span><strong>{properties.length}</strong> {client ? 'imóveis encontrados' : 'imóveis na carteira'}</span>
        {!client && <span><strong className="green-text">{properties.filter((property) => property.status === 'DISPONIVEL').length}</strong> disponíveis</span>}
        {client && <span className="count-note">Feitos para o seu próximo começo.</span>}
      </div>
      <section className="filter-row">
        <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={client ? 'Busque por bairro, cidade ou código' : 'Buscar por código, bairro ou endereço'} /><kbd>⌘ K</kbd></label>
        <label className="select-filter"><SlidersHorizontal size={16} /><select value={purpose} onChange={(event) => onPurpose(event.target.value)} aria-label="Finalidade"><option value="">Finalidade</option><option value="VENDA">Venda</option><option value="LOCACAO">Locação</option></select><ChevronDown size={14} /></label>
        <label className="select-filter"><House size={16} /><select value={type} onChange={(event) => onType(event.target.value)} aria-label="Tipo de imóvel"><option value="">Tipo de imóvel</option><option value="apartamento">Apartamento</option><option value="casa">Casa</option></select><ChevronDown size={14} /></label>
        <button className="filter-button" onClick={() => { onSearch(''); onType(''); onPurpose(''); }}><Filter size={16} /> Limpar filtros</button>
      </section>
      <div className="results-line"><span>{loading ? 'Carregando imóveis...' : client ? `${properties.length} imóveis encontrados` : `Exibindo ${properties.length} imóveis da carteira`}</span>{client && <button className="sort-button"><ArrowDownUp size={14} /> Mais recentes</button>}</div>
      {loading ? <div className="loading-grid"><div /><div /><div /></div>
        : properties.length
          ? <div className="property-grid">{properties.map((property) => (
            <PropertyCard key={property.id} property={property} favorite={favoriteIds.includes(property.id)} onFavorite={() => onFavorite(property.id)} onOpen={() => onOpenProperty(property)} onLead={() => onLead(property)} client={client} />
          ))}</div>
          : <EmptyState icon={Search} title="Nenhum imóvel encontrado" text="Tente mudar a busca ou remover alguns filtros." />}
    </>
  );
}

function PropertyCard({ property, favorite, onFavorite, onOpen, onLead, client = false }) {
  return (
    <article className="property-card">
      <button className="property-photo" onClick={onOpen} aria-label={`Ver detalhes de ${property.titulo}`}>
        <img src={property.imagem} alt={property.titulo} loading="lazy" />
        <span className={`purpose-badge ${property.finalidade === 'LOCACAO' ? 'rent-badge' : ''}`}>{property.finalidade === 'LOCACAO' ? 'Locação' : 'Venda'}</span>
        <span className={`availability ${property.status === 'DISPONIVEL' ? '' : 'reserved'}`}>{property.status === 'DISPONIVEL' ? 'Disponível' : 'Em negociação'}</span>
      </button>
      <div className="property-info">
        <div className="property-code-row"><span>{property.codigo}</span>{onFavorite && <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>}</div>
        <button className="property-title" onClick={onOpen}>{property.titulo}</button>
        <span className="property-location">{property.bairro} · {property.cidade}, {property.estado}</span>
        <div className="property-features"><span><Tag size={14} /> {property.area} m²</span><span><BedDouble size={15} /> {property.quartos}</span><span><House size={14} /> {property.banheiros}</span></div>
        <div className="property-price-row"><strong>{compactCurrency(property.preco)}{property.finalidade === 'LOCACAO' && <small>/mês</small>}</strong>{client && onLead && <button className="card-contact-button" onClick={onLead}>Tenho interesse <ArrowRight size={14} /></button>}<button className="open-property" onClick={onOpen} aria-label="Abrir imóvel"><ArrowUpRight size={18} /></button></div>
      </div>
    </article>
  );
}

function PropertyDialog({ property, profile, favorite, onClose, onFavorite, onLead }) {
  const client = profile === 'cliente';
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="property-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <div className="dialog-image"><img src={property.imagem} alt={property.titulo} /><span className="purpose-badge">{property.finalidade === 'LOCACAO' ? 'Locação' : 'Venda'}</span></div>
        <div className="dialog-content"><div className="property-code-row"><span>{property.codigo} · {property.bairro}, {property.cidade}</span>{onFavorite && <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label="Favoritar imóvel"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button>}</div>
          <h2>{property.titulo}</h2><p>{property.descricao}</p>
          <div className="dialog-specs"><span><Tag size={16} />{property.area} m²</span><span><BedDouble size={16} />{property.quartos} quartos</span><span><House size={16} />{property.banheiros} banheiros</span></div>
          <div className="dialog-bottom"><strong>{compactCurrency(property.preco)}{property.finalidade === 'LOCACAO' && <small>/mês</small>}</strong>{client && <button className="button button-dark" onClick={onLead}><MessageCircle size={16} /> Tenho interesse</button>}</div>
        </div>
      </section>
    </div>
  );
}

function LeadDialog({ property, errorMessage, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="lead-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">VAMOS CONVERSAR</span><h2>Esse pode ser o seu lugar.</h2>
        <p>Deixe seus dados e a equipe Morada entra em contato com você.</p>
        {property && <div className="lead-property-preview"><img src={property.imagem} alt="" /><span><strong>{property.titulo}</strong><small>{property.codigo} · {compactCurrency(property.preco)}</small></span></div>}
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          <label>Seu nome<input name="nome" placeholder="Como podemos chamar você?" maxLength={100} required /></label>
          <div className="form-two"><label>E-mail<input name="email" type="email" placeholder="voce@email.com" maxLength={254} required /></label><label>Telefone<input name="telefone" type="tel" placeholder="(19) 99999-9999" maxLength={20} required /></label></div>
          <label>O que gostaria de saber?<textarea name="mensagem" placeholder="Conte um pouco sobre o que procura..." rows="3" maxLength={1000} /></label>
          {errorMessage && <p className="lead-form-error" role="alert">{errorMessage}</p>}
          <button className="button button-dark submit-button" type="submit">Solicitar contato <ArrowRight size={16} /></button>
        </form>
      </section>
    </div>
  );
}

function LeadWorkspace({ dashboard, leads, onShowProperties, onAddContact }) {
  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">RELACIONAMENTO</p><h1>Meus contatos</h1><p className="page-subtitle">Cada boa conversa pode começar uma nova história.</p></div><button className="button button-dark" onClick={onAddContact}><Plus size={17} /> Adicionar contato</button></section>
      <section className="metric-grid small-metrics"><MetricCard icon={Users} label="Leads ativos" value={dashboard?.novosLeads ?? 0} detail="No momento" /><MetricCard icon={Clock3} label="Aguardando retorno" value="2" detail="Responda com carinho" tone="sand" /><MetricCard icon={CalendarDays} label="Visitas agendadas" value="4" detail="Nesta semana" tone="mint" /></section>
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Seus contatos</h2><p>Organize conversas e próximos passos.</p></div><button className="select-filter compact-select"><ListFilter size={15} /> Todos os contatos <ChevronDown size={14} /></button></div>
        <div className="contact-table"><div className="table-row table-head"><span>CONTATO</span><span>INTERESSE</span><span>ÚLTIMO CONTATO</span><span>STATUS</span><span /></div>
          {leads.map((lead, index) => <ContactRow key={lead.id} initials={lead.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()} name={lead.nome} email={lead.email} interest={lead.interesse} date={lead.data} status={lead.status} tone={['coral', 'lilac', 'mint'][index % 3]} />)}
          {!leads.length && <EmptyState icon={Users} title="Ainda não há leads" text="As solicitações de contato dos clientes aparecerão aqui." />}
        </div>
      </section>
      <div className="tip-banner"><Sparkles size={20} /><span><strong>Uma boa indicação começa com escuta.</strong><small>Confira imóveis que combinam com o perfil dos seus clientes.</small></span><button className="text-button" onClick={onShowProperties}>Ver imóveis <ArrowRight size={15} /></button></div>
    </>
  );
}

function ContactDialog({ properties, errorMessage, saving, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">RELACIONAMENTO</span>
        <h2 id="contact-dialog-title">Adicionar contato</h2>
        <p>Cadastre os dados do cliente para acompanhar o relacionamento.</p>
        <form className="workflow-form" onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          <label>Nome completo<input name="nome" placeholder="Nome do cliente" maxLength={100} required /></label>
          <div className="form-two">
            <label>E-mail<input name="email" type="email" placeholder="cliente@email.com" maxLength={254} required /></label>
            <label>Telefone<input name="telefone" type="tel" placeholder="(19) 99999-9999" maxLength={20} required /></label>
          </div>
          <label>Imóvel de interesse
            <select name="imovelId" defaultValue="">
              <option value="">Ainda não definido</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.titulo} · {property.codigo}</option>)}
            </select>
          </label>
          <label>Observações<textarea name="mensagem" placeholder="Anote informações importantes sobre o contato..." rows="3" maxLength={1000} /></label>
          {errorMessage && <p className="lead-form-error" role="alert">{errorMessage}</p>}
          <div className="workflow-actions">
            <button className="button button-light" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar contato'} <ArrowRight size={16} /></button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ContactRow({ initials, name, email, interest, date, status, tone }) {
  return <div className="table-row"><span className="table-person"><span className={`avatar lead-avatar ${tone}`}>{initials}</span><span><strong>{name}</strong><small>{email}</small></span></span><span>{interest}</span><span>{date}</span><span><i className={`status-dot ${tone}`} />{status}</span><button className="icon-button"><MoreHorizontal size={18} /></button></div>;
}

function DealWorkspace({ properties, deals, activeDealCount, onCreateDeal }) {
  const [addingDeal, setAddingDeal] = useState(false);
  const [dealError, setDealError] = useState('');

  function addDeal(formData) {
    const property = properties.find((item) => item.id === Number(formData.get('imovelId')));
    const name = formData.get('cliente').trim();
    const stage = formData.get('etapa');
    const progressByStage = {
      'Primeiro contato': 1,
      'Visita agendada': 2,
      'Proposta enviada': 3,
      'Documentação': 4,
    };
    if (!property) {
      setDealError('Selecione um imóvel válido para a negociação.');
      return;
    }
    onCreateDeal({
      id: Date.now(),
      initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
      name,
      property: `${property.titulo} · ${property.codigo}`,
      amount: compactCurrency(Number(formData.get('valor'))),
      stage,
      progress: progressByStage[stage],
      tone: 'mint',
    });
    setDealError('');
    setAddingDeal(false);
  }

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">DO PRIMEIRO OI À CHAVE</p><h1>Negociações</h1><p className="page-subtitle">Acompanhe cada etapa até o novo começo.</p></div><button className="button button-dark" onClick={() => { setDealError(''); setAddingDeal(true); }}><Plus size={17} /> Nova negociação</button></section>
      <section className="metric-grid small-metrics"><MetricCard icon={ClipboardList} label="Em andamento" value={activeDealCount} detail="Inclui negócios criados nesta sessão" /><MetricCard icon={CheckCheck} label="Concluídas no mês" value="8" detail="Um ótimo resultado" tone="mint" /><MetricCard icon={Clock3} label="Aguardando proposta" value="3" detail="Próxima ação necessária" tone="sand" /></section>
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Suas negociações</h2><p>Uma visão clara do que vem pela frente.</p></div><button className="select-filter compact-select"><ArrowDownUp size={15} /> Mais recentes <ChevronDown size={14} /></button></div>
        <div className="deal-list">{deals.map((deal) => <DealRow key={deal.id} {...deal} />)}</div>
      </section>
      {addingDeal && (
        <div className="modal-backdrop" onClick={() => setAddingDeal(false)}>
          <section className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="deal-dialog-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setAddingDeal(false)} aria-label="Fechar"><X size={20} /></button>
            <span className="eyebrow">DO PRIMEIRO OI À CHAVE</span>
            <h2 id="deal-dialog-title">Nova negociação</h2>
            <p>Registre o cliente, o imóvel e a etapa atual do negócio.</p>
            <form className="workflow-form" onSubmit={(event) => { event.preventDefault(); addDeal(new FormData(event.currentTarget)); }}>
              <label>Nome do cliente<input name="cliente" placeholder="Nome do cliente" maxLength={100} required /></label>
              <label>Imóvel
                <select name="imovelId" defaultValue="" required>
                  <option value="" disabled>Selecione um imóvel</option>
                  {properties.map((property) => <option key={property.id} value={property.id}>{property.titulo} · {property.codigo}</option>)}
                </select>
              </label>
              <div className="form-two">
                <label>Valor da negociação<input name="valor" type="number" min="1" step="0.01" placeholder="Ex.: 750000" required /></label>
                <label>Etapa
                  <select name="etapa" defaultValue="Primeiro contato">
                    <option>Primeiro contato</option>
                    <option>Visita agendada</option>
                    <option>Proposta enviada</option>
                    <option>Documentação</option>
                  </select>
                </label>
              </div>
              {dealError && <p className="lead-form-error" role="alert">{dealError}</p>}
              <p className="workflow-note">Esta negociação ficará disponível nesta sessão de demonstração.</p>
              <div className="workflow-actions">
                <button className="button button-light" type="button" onClick={() => setAddingDeal(false)}>Cancelar</button>
                <button className="button button-dark" type="submit">Criar negociação <ArrowRight size={16} /></button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function DealRow({ initials, name, property, amount, stage, progress, tone }) {
  return <div className="deal-row"><span className={`avatar lead-avatar ${tone}`}>{initials}</span><span className="deal-person"><strong>{name}</strong><small>{property}</small></span><strong className="deal-amount">{amount}</strong><span className="deal-stage"><i className={`status-dot ${tone}`} />{stage}</span><div className="progress-dots">{[1, 2, 3, 4].map((step) => <i key={step} className={step <= progress ? 'step-done' : ''} />)}</div><button className="icon-button"><MoreHorizontal size={18} /></button></div>;
}

function EmptyState({ icon: Icon, title, text }) {
  return <div className="empty-state"><Icon size={27} /><strong>{title}</strong><span>{text}</span></div>;
}

export default App;
