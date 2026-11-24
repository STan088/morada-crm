import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowDownUp, ArrowRight, ArrowUpRight, Bell, BedDouble, BriefcaseBusiness,
  Building2, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight,
  CircleHelp, ClipboardList, Clock3, Eye, EyeOff, Filter, Heart, House,
  LayoutDashboard, ListFilter, LockKeyhole, LogOut, Mail, Menu, MessageCircle,
  MoreHorizontal, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles,
  Sprout, Tag, User, UserPlus, Users, X, Send,
} from 'lucide-react';
import { AiChatWorkspace } from './AiChatWorkspace';
import { getInitials } from './utils';

const API = 'http://localhost:8080/api';
const USERS_STORAGE_KEY = 'morada_crm_users_db_v1';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
});
const compactCurrency = (value) => currency.format(value || 0);

const DEFAULT_USERS = [
  {
    id: 'demo-cliente',
    name: 'Marina Almeida',
    email: 'cliente@morada.com.br',
    password: '123',
    role: 'cliente',
    phone: '(19) 99812-3344',
  },
  {
    id: 'demo-corretor',
    name: 'Marina Costa',
    email: 'corretor@morada.com.br',
    password: '123',
    role: 'corretor',
    creci: 'CRECI 123456',
    phone: '(19) 99745-8899',
  },
];

function loadUsersDB() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsersDB(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Fallback silencioso
  }
}

const initialDealsData = [
  { id: 1, initials: 'PA', name: 'Pedro Alves', property: 'Apartamento em Cambuí · IM-021', amount: 'R$ 930.000', stage: 'Contraproposta', progress: 3, tone: 'lilac', chat: [{ sender: 'client', text: 'Bom dia! Recebi a documentação, podemos fechar em 900 mil?' }] },
  { id: 2, initials: 'RF', name: 'Rafael Ferreira', property: 'Casa no Parque Prado · IM-011', amount: 'R$ 720.000', stage: 'Documentação', progress: 4, tone: 'mint', chat: [{ sender: 'client', text: 'Já enviei o comprovante de renda pro seu email.' }] },
  { id: 3, initials: 'AS', name: 'Ana Souza', property: 'Apartamento com varanda · IM-014', amount: 'R$ 760.000', stage: 'Primeiro contato', progress: 1, tone: 'coral', chat: [{ sender: 'client', text: 'Gostei muito da varanda, quando podemos visitar?' }] },
];

export default function App() {
  const [usersDB, setUsersDB] = useState(loadUsersDB);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginProfile, setLoginProfile] = useState('cliente');

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState(initialDealsData);
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Nova proposta recebida de Pedro Alves.', time: 'Há 10 min', unread: true }
  ]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const [propsRes, dashRes, leadsRes] = await Promise.all([
          fetch(`${API}/imoveis`),
          fetch(`${API}/dashboard`),
          fetch(`${API}/leads`),
        ]);
        if (propsRes.ok && dashRes.ok && leadsRes.ok && active) {
          const [propsData, dashData, leadsData] = await Promise.all([
            propsRes.json(), dashRes.json(), leadsRes.json()
          ]);
          setProperties(propsData);
          setDashboard(dashData);
          setLeads(leadsData.map((l) => ({
            ...l,
            status: l.status || 'Novo lead',
            chat: [{ sender: 'client', text: l.mensagem || 'Olá, tenho interesse neste imóvel!' }]
          })));
          setDataLoaded(true);
        }
      } catch {
        if (active) setGlobalError('Não foi possível carregar os dados da API Java.');
      }
    };
    if (!dataLoaded) loadInitialData();
    return () => { active = false; };
  }, [dataLoaded]);

  function handleRegisterUser(newUserData) {
    const exists = usersDB.some(
      (u) => u.email.toLowerCase() === newUserData.email.toLowerCase() && u.role === newUserData.role
    );
    if (exists) {
      return { ok: false, error: 'Já existe uma conta cadastrada com este e-mail para este perfil.' };
    }
    const createdUser = {
      id: `user-${Date.now()}`,
      ...newUserData,
    };
    const updated = [...usersDB, createdUser];
    setUsersDB(updated);
    saveUsersDB(updated);
    setCurrentUser(createdUser);
    return { ok: true };
  }

  function handleLoginUser({ email, password, role }) {
    const matched = usersDB.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role
    );
    if (matched) {
      if (matched.password && password && matched.password !== password) {
        return { ok: false, error: 'Senha incorreta para esta conta.' };
      }
      setCurrentUser(matched);
      return { ok: true };
    }

    const derivedName = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    setCurrentUser({
      id: `session-${Date.now()}`,
      name: derivedName || (role === 'corretor' ? 'Corretor Morada' : 'Cliente Morada'),
      email: email.trim(),
      role,
      creci: role === 'corretor' ? 'CRECI 123456' : undefined,
    });
    return { ok: true };
  }

  if (!currentUser) {
    return (
      <LoginPage
        initialProfile={loginProfile}
        usersDB={usersDB}
        onLogin={handleLoginUser}
        onRegister={handleRegisterUser}
        onProfileChange={setLoginProfile}
      />
    );
  }

  return (
    <CrmWorkspace
      key={`${currentUser.id}-${currentUser.role}`}
      user={currentUser}
      onLogout={() => setCurrentUser(null)}
      properties={properties} setProperties={setProperties}
      leads={leads} setLeads={setLeads}
      deals={deals} setDeals={setDeals}
      dashboard={dashboard} setDashboard={setDashboard}
      notifications={notifications} setNotifications={setNotifications}
      globalError={globalError}
      dataLoaded={dataLoaded}
    />
  );
}

function LoginPage({ initialProfile, usersDB, onLogin, onRegister, onProfileChange }) {
  const [profile, setProfile] = useState(initialProfile);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [formError, setFormError] = useState('');

  const client = profile === 'cliente';

  function handleTabChange(nextProfile) {
    setProfile(nextProfile);
    onProfileChange(nextProfile);
    setHelpMessage('');
    setFormError('');
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    setHelpMessage('');
    setFormError('');
    const formData = new FormData(event.currentTarget);

    if (authMode === 'register') {
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const creci = String(formData.get('creci') || '').trim();

      if (name.length < 3) {
        setFormError('Informe seu nome completo.');
        return;
      }
      if (password.length < 3) {
        setFormError('A senha deve ter pelo menos 3 caracteres.');
        return;
      }

      const res = onRegister({
        name,
        email,
        password,
        phone,
        role: profile,
        creci: !client ? (creci || 'CRECI 123456') : undefined,
      });

      if (!res.ok) setFormError(res.error);
      return;
    }

    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '').trim();
    const res = onLogin({ email, password, role: profile });
    if (!res.ok) setFormError(res.error);
  }

  const savedAccountsForRole = usersDB.filter((u) => u.role === profile);

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand login-brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><House size={19} strokeWidth={1.8} /></span>
          <span>morada</span>
        </a>
        <button
          className="login-help"
          onClick={() => setHelpMessage('Você pode criar uma conta nova agora mesmo ou clicar em uma das contas salvas abaixo para testar.')}
        >
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
              type="button"
              className={client ? 'selected' : ''}
              role="tab"
              aria-selected={client}
              onClick={() => handleTabChange('cliente')}
            >
              <Users size={16} /> Sou cliente
            </button>
            <button
              type="button"
              className={!client ? 'selected' : ''}
              role="tab"
              aria-selected={!client}
              onClick={() => handleTabChange('corretor')}
            >
              <BriefcaseBusiness size={16} /> Sou corretor
            </button>
          </div>

          <div className="login-company"><Building2 size={15} /> Imobiliária Horizonte</div>
          <h2>
            {authMode === 'register'
              ? (client ? 'Criar conta de cliente' : 'Cadastrar novo corretor')
              : (client ? 'Acesse a área do cliente' : 'Acesse a área do corretor')}
          </h2>
          <p className="login-description">
            {authMode === 'register'
              ? 'Preencha seus dados para salvar seu perfil no banco local e acessar o sistema.'
              : (client
                ? 'Entre para acompanhar seus imóveis, visitas e propostas.'
                : 'Entre para cuidar dos seus clientes e próximos negócios.')}
          </p>

          <form className="login-form" onSubmit={handleFormSubmit}>
            {authMode === 'register' && (
              <>
                <label className="login-field-label" htmlFor="reg-name">Nome completo</label>
                <div className="login-input-wrap">
                  <User size={18} />
                  <input id="reg-name" name="name" type="text" placeholder="Ex: Joaquim Pereira" required />
                </div>
              </>
            )}

            <label className="login-field-label" htmlFor="login-email">
              {client ? 'E-mail' : 'E-mail profissional'}
            </label>
            <div className="login-input-wrap">
              <Mail size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder={client ? 'joaquim@email.com' : 'joaquim@imobiliaria.com.br'}
                required
                autoComplete="email"
              />
            </div>

            {authMode === 'register' && (
              <div className="form-two" style={{ marginBottom: '2px' }}>
                <div>
                  <label className="login-field-label" htmlFor="reg-phone">Telefone</label>
                  <div className="login-input-wrap">
                    <input id="reg-phone" name="phone" type="tel" placeholder="(19) 99999-9999" />
                  </div>
                </div>
                {!client && (
                  <div>
                    <label className="login-field-label" htmlFor="reg-creci">Registro CRECI</label>
                    <div className="login-input-wrap">
                      <input id="reg-creci" name="creci" type="text" placeholder="CRECI 234567" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <label className="login-field-label" htmlFor="login-password">Senha</label>
            <div className="login-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={authMode === 'register' ? 'Crie uma senha' : 'Digite sua senha'}
                required
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {authMode === 'login' && (
              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  className="login-inline-link"
                  onClick={() => setHelpMessage('Para redefinir sua senha, crie uma nova conta ou use uma das contas rápidas abaixo.')}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {formError && <p className="lead-form-error" style={{ marginBottom: '12px' }} role="alert">{formError}</p>}

            <button className="login-submit" type="submit">
              {authMode === 'register'
                ? 'Concluir cadastro e entrar'
                : (client ? 'Entrar na área do cliente' : 'Entrar no CRM')}
              <ArrowRight size={17} />
            </button>
          </form>

          {authMode === 'login' && savedAccountsForRole.length > 0 && (
            <div className="quick-accounts-box">
              <small>Contas cadastradas ({client ? 'Clientes' : 'Corretores'}):</small>
              <div className="quick-accounts-list">
                {savedAccountsForRole.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className="quick-account-chip"
                    onClick={() => onLogin({ email: acc.email, password: acc.password, role: acc.role })}
                  >
                    <span className="chip-avatar">{getInitials(acc.name)}</span>
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="first-access-card" style={{ marginTop: '14px' }}>
            <strong>
              {authMode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui cadastro?'}
            </strong>
            <p>
              {authMode === 'login'
                ? `Cadastre-se gratuitamente como ${client ? 'cliente' : 'corretor'} no banco local.`
                : 'Volte para a tela de acesso e entre com seu e-mail e senha.'}
            </p>
            <button
              type="button"
              className="first-access-link"
              onClick={() => {
                setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
                setFormError('');
                setHelpMessage('');
              }}
            >
              {authMode === 'login' ? (
                <><UserPlus size={14} /> Criar conta gratuita <ArrowUpRight size={14} /></>
              ) : (
                <>Fazer login na minha conta <ArrowUpRight size={14} /></>
              )}
            </button>
          </div>

          <div className="secure-note"><ShieldCheck size={15} /> Banco de usuários persistente ativo.</div>
          {helpMessage && (
            <div className="login-help-message" role="status">
              <span>{helpMessage}</span>
              <button onClick={() => setHelpMessage('')} aria-label="Fechar"><X size={15} /></button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CrmWorkspace({
  user,
  onLogout,
  properties,
  setProperties,
  leads,
  setLeads,
  deals,
  setDeals,
  dashboard,
  setDashboard,
  notifications,
  setNotifications,
  globalError,
  dataLoaded,
}) {
  const profile = user.role;
  const userInitials = getInitials(user.name);

  const [section, setSection] = useState(profile === 'corretor' ? 'Visão geral' : 'Explorar imóveis');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [leadProperty, setLeadProperty] = useState(null);
  const [leadError, setLeadError] = useState('');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [contactError, setContactError] = useState('');
  const [propertyError, setPropertyError] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [propertySaving, setPropertySaving] = useState(false);

  const [activeChatLead, setActiveChatLead] = useState(null);
  const [activeDealChat, setActiveDealChat] = useState(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [notice, setNotice] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredProperties = useMemo(() => {
    let result = section === 'Favoritos' ? properties.filter((p) => favoriteIds.includes(p.id)) : properties;

    if (search.trim()) {
      const s = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      result = result.filter((p) =>
        p.bairro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(s) ||
        p.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(s) ||
        p.codigo.toLowerCase().includes(s) ||
        p.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(s)
      );
    }
    if (type) {
      result = result.filter((p) => p.tipo.toLowerCase() === type.toLowerCase());
    }
    if (purpose) {
      result = result.filter((p) => p.finalidade.toUpperCase() === purpose.toUpperCase());
    }
    return result;
  }, [properties, section, favoriteIds, search, type, purpose]);

  async function createLeadRecord(payload) {
    try {
      const response = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.message || 'Falha ao enviar.');
      return result;
    } catch {
      const prop = properties.find((p) => p.id === payload.imovelId);
      return {
        id: Date.now(),
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        interesse: prop ? prop.titulo : 'Atendimento geral',
        mensagem: payload.mensagem,
        data: 'Hoje',
      };
    }
  }

  async function submitLead(formData) {
    setNotice('');
    setLeadError('');
    try {
      const result = await createLeadRecord({
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        imovelId: leadProperty?.id ?? null,
        mensagem: formData.get('mensagem'),
      });
      setNotice('Sua mensagem foi enviada. O corretor retornará na aba "Mensagens".');
      setLeads((previous) => [
        { ...result, status: 'Novo lead', chat: [{ sender: 'client', text: result.mensagem || 'Tenho interesse!' }] },
        ...previous,
      ]);
      setNotifications((prev) => [
        { id: Date.now(), text: `Novo interesse de ${result.nome}`, time: 'Agora', unread: true },
        ...prev,
      ]);
      setLeadProperty(null);
      setDashboard((previous) => (previous ? { ...previous, novosLeads: previous.novosLeads + 1 } : previous));
    } catch (err) {
      setLeadError(err.message);
    }
  }

  async function handleQuickLeadFromAi(payload) {
    const result = await createLeadRecord(payload);
    setLeads((previous) => [
      { ...result, status: 'Visita agendada', chat: [{ sender: 'client', text: result.mensagem }] },
      ...previous,
    ]);
    setNotifications((prev) => [
      { id: Date.now(), text: `Visita agendada via IA por ${result.nome}`, time: 'Agora', unread: true },
      ...prev,
    ]);
    setDashboard((previous) => (previous ? { ...previous, novosLeads: previous.novosLeads + 1 } : previous));
  }

  async function submitContact(formData) {
    setContactError('');
    setContactSaving(true);
    try {
      const propertyId = formData.get('imovelId');
      const result = await createLeadRecord({
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        imovelId: propertyId ? Number(propertyId) : null,
        mensagem: formData.get('mensagem'),
      });
      setLeads((previous) => [
        { ...result, status: 'Novo lead', chat: [{ sender: 'client', text: result.mensagem || 'Olá, busco informações.' }] },
        ...previous,
      ]);
      setContactDialogOpen(false);
      setNotice('Contato adicionado com sucesso.');
    } catch (err) {
      setContactError(err.message);
    } finally {
      setContactSaving(false);
    }
  }

  async function submitNewProperty(formData) {
    setPropertyError('');
    setPropertySaving(true);
    try {
      const newProp = {
        id: Date.now(),
        codigo: `IM-0${properties.length + 10}`,
        tipo: formData.get('tipo'),
        finalidade: formData.get('finalidade'),
        titulo: formData.get('titulo'),
        endereco: formData.get('endereco'),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade') || 'Campinas',
        estado: 'SP',
        area: Number(formData.get('area')),
        quartos: Number(formData.get('quartos')),
        banheiros: Number(formData.get('banheiros')),
        preco: Number(formData.get('preco')),
        status: 'DISPONIVEL',
        imagem:
          formData.get('imagem') ||
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
        descricao: formData.get('descricao') || 'Imóvel recém-adicionado à carteira Morada.',
        condominio: Number(formData.get('condominio') || 0),
        andar: Number(formData.get('andar') || 0),
        quintal: formData.get('quintal') === 'true',
      };
      setProperties((prev) => [newProp, ...prev]);
      setPropertyDialogOpen(false);
      setNotice('Imóvel cadastrado no catálogo e sincronizado com a Consultora IA!');
      setDashboard((prev) =>
        prev
          ? { ...prev, imoveisDisponiveis: prev.imoveisDisponiveis + 1, imoveisNaCarteira: prev.imoveisNaCarteira + 1 }
          : prev
      );
    } catch {
      setPropertyError('Erro ao cadastrar imóvel.');
    } finally {
      setPropertySaving(false);
    }
  }

  function updateLeadStatus(leadId, newStatus) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  }

  function updateDealStage(dealId, newStage) {
    const progressByStage = { 'Primeiro contato': 1, 'Visita agendada': 2, 'Proposta enviada': 3, Documentação: 4 };
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, progress: progressByStage[newStage] || 1 } : d))
    );
  }

  function addDeal(deal) {
    setDeals((previous) => [deal, ...previous]);
  }

  function sendLeadMessage(leadId, text, senderProfile) {
    if (!text.trim()) return;
    const role = senderProfile === 'corretor' ? 'corretor' : 'client';

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, chat: [...l.chat, { sender: role, text: text.trim() }] } : l))
    );
    setActiveChatLead((curr) =>
      curr ? { ...curr, chat: [...curr.chat, { sender: role, text: text.trim() }] } : curr
    );

    const senderName = senderProfile === 'corretor' ? `Corretor (${user.name})` : `Cliente (${user.name})`;
    setNotifications((prev) => [
      { id: Date.now(), text: `Nova mensagem de ${senderName}`, time: 'Agora', unread: true },
      ...prev,
    ]);
  }

  function sendDealMessage(dealId, text, senderProfile) {
    if (!text.trim()) return;
    const role = senderProfile === 'corretor' ? 'corretor' : 'client';

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, chat: [...d.chat, { sender: role, text: text.trim() }] } : d))
    );
    setActiveDealChat((curr) =>
      curr ? { ...curr, chat: [...curr.chat, { sender: role, text: text.trim() }] } : curr
    );

    const senderName = senderProfile === 'corretor' ? 'Corretor' : 'Cliente';
    setNotifications((prev) => [
      { id: Date.now(), text: `Atualização na negociação (${senderName})`, time: 'Agora', unread: true },
      ...prev,
    ]);
  }

  function toggleFavorite(id) {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]
    );
  }

  function chooseSection(name) {
    setSection(name);
    setMobileMenu(false);
    setShowUserMenu(false);
    setSearch('');
    setType('');
    setPurpose('');
  }

  const activeDealCount = deals.filter((d) => d.stage !== 'Documentação').length;
  const loading = !dataLoaded;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const navItems =
    profile === 'corretor'
      ? [
          { name: 'Visão geral', icon: LayoutDashboard },
          { name: 'Imóveis', icon: House },
          { name: 'Meus contatos', icon: MessageCircle },
          { name: 'Negociações', icon: ClipboardList },
        ]
      : [
          { name: 'Explorar imóveis', icon: House },
          { name: 'Mensagens', icon: MessageCircle },
          { name: 'Favoritos', icon: Heart },
          { name: 'Assistente IA', icon: Sparkles },
        ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            chooseSection(profile === 'corretor' ? 'Visão geral' : 'Explorar imóveis');
          }}
        >
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
            <button
              key={name}
              className={`nav-item ${section === name ? 'active' : ''}`}
              onClick={() => chooseSection(name)}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{name}</span>
              {name === 'Meus contatos' && dashboard?.novosLeads > 0 && (
                <span className="nav-count">{dashboard.novosLeads}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <Sprout size={23} strokeWidth={1.6} />
            <strong>Mais tempo para conectar.</strong>
            <span>Seu próximo bom negócio começa aqui.</span>
          </div>
          <button
            className="help-link"
            onClick={() => setNotice('Central de Ajuda: Utilize o menu superior direito para acessar seus dados ou sair da conta.')}
          >
            <CircleHelp size={17} /> Central de ajuda
          </button>

          <div className="profile-row">
            <div className="avatar">{userInitials}</div>
            <span>
              <strong>{user.name}</strong>
              <small>{profile === 'corretor' ? `Corretor · ${user.creci || 'CRECI 123456'}` : 'Cliente'}</small>
            </span>
            <button className="logout-button" onClick={onLogout} title="Sair da conta" aria-label="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-backdrop" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Área de trabalho</span>
            <ChevronRight size={15} />
            <strong>{section}</strong>
          </div>

          <div className="topbar-actions" style={{ position: 'relative' }}>
            <button
              className="icon-button notification-button"
              aria-label="Notificações"
              onClick={() => {
                setShowUserMenu(false);
                setShowNotificationsDropdown((prev) => !prev);
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span />}
            </button>

            {showNotificationsDropdown && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <strong>Notificações</strong>
                  <span onClick={() => setNotifications([])}>Limpar tudo</span>
                </div>
                <div className="dropdown-list">
                  {notifications.map((n) => (
                    <div key={n.id} className={`dropdown-item ${n.unread ? 'unread' : ''}`}>
                      <p>{n.text}</p>
                      <small>{n.time}</small>
                    </div>
                  ))}
                  {!notifications.length && <div className="dropdown-empty">Nenhuma notificação por enquanto.</div>}
                </div>
              </div>
            )}

            <button
              type="button"
              className="topbar-user-trigger"
              onClick={() => {
                setShowNotificationsDropdown(false);
                setShowUserMenu((prev) => !prev);
              }}
              aria-label="Menu do usuário"
            >
              <div className="avatar avatar-small">{userInitials}</div>
              <span className="topbar-user-name">{user.name}</span>
              <ChevronDown size={14} className="muted" />
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="avatar">{userInitials}</div>
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <span className="user-role-pill">
                      {profile === 'corretor' ? 'Corretor' : 'Cliente'}
                    </span>
                  </div>
                </div>

                <div className="user-menu-items">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setProfileModalOpen(true);
                    }}
                  >
                    <User size={15} /> Meu perfil e dados
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      chooseSection(profile === 'corretor' ? 'Imóveis' : 'Favoritos');
                    }}
                  >
                    <House size={15} />
                    {profile === 'corretor' ? 'Minha carteira de imóveis' : 'Meus imóveis favoritos'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      chooseSection(profile === 'corretor' ? 'Meus contatos' : 'Mensagens');
                    }}
                  >
                    <MessageCircle size={15} />
                    {profile === 'corretor' ? 'Mensagens e contatos' : 'Minhas mensagens'}
                  </button>

                  <div className="user-menu-divider" />

                  <button
                    type="button"
                    className="user-menu-logout"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={15} /> Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          {globalError && (
            <div className="alert alert-error">
              <span>{globalError}</span>
              <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
          )}
          {notice && (
            <div className="alert alert-success">
              <Check size={17} /> {notice}
              <button onClick={() => setNotice('')} aria-label="Fechar"><X size={16} /></button>
            </div>
          )}

          {profile === 'corretor' && section === 'Visão geral' && (
            <BrokerDashboard
              userName={user.name}
              dashboard={dashboard}
              leads={leads}
              properties={properties}
              loading={loading}
              onSection={chooseSection}
              onOpenProperty={setSelectedProperty}
            />
          )}

          {((profile === 'corretor' && section === 'Imóveis') ||
            (profile === 'cliente' && ['Explorar imóveis', 'Favoritos'].includes(section))) && (
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
              onAddProperty={() => setPropertyDialogOpen(true)}
            />
          )}

          {profile === 'cliente' && section === 'Mensagens' && (
            <ClientMessagesWorkspace
              leads={leads}
              onShowProperties={() => chooseSection('Explorar imóveis')}
              onOpenChat={(lead) => setActiveChatLead(lead)}
            />
          )}

          {profile === 'corretor' && section === 'Meus contatos' && (
            <LeadWorkspace
              dashboard={dashboard}
              leads={leads}
              onShowProperties={() => chooseSection('Imóveis')}
              onAddContact={() => {
                setContactError('');
                setContactDialogOpen(true);
              }}
              onUpdateStatus={updateLeadStatus}
              onOpenChat={(lead) => setActiveChatLead(lead)}
            />
          )}

          {profile === 'corretor' && section === 'Negociações' && (
            <DealWorkspace
              properties={properties}
              deals={deals}
              activeDealCount={activeDealCount}
              onCreateDeal={addDeal}
              onUpdateStage={updateDealStage}
              onOpenChat={(deal) => setActiveDealChat(deal)}
            />
          )}

          {profile === 'cliente' && section === 'Assistente IA' && (
            <AiChatWorkspace
              properties={properties}
              userName={user.name}
              userEmail={user.email}
              userPhone={user.phone}
              onOpenProperty={setSelectedProperty}
              onQuickLead={handleQuickLeadFromAi}
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
          onLead={() => {
            setLeadProperty(selectedProperty);
            setSelectedProperty(null);
          }}
        />
      )}

      {leadProperty && (
        <LeadDialog
          property={leadProperty}
          defaultName={user.name}
          defaultEmail={user.email}
          defaultPhone={user.phone}
          errorMessage={leadError}
          onClose={() => {
            setLeadProperty(null);
            setLeadError('');
          }}
          onSubmit={submitLead}
        />
      )}

      {contactDialogOpen && (
        <ContactDialog
          properties={properties}
          errorMessage={contactError}
          saving={contactSaving}
          onClose={() => setContactDialogOpen(false)}
          onSubmit={submitContact}
        />
      )}

      {propertyDialogOpen && (
        <NewPropertyDialog
          errorMessage={propertyError}
          saving={propertySaving}
          onClose={() => setPropertyDialogOpen(false)}
          onSubmit={submitNewProperty}
        />
      )}

      {profileModalOpen && (
        <UserProfileModal
          user={user}
          onClose={() => setProfileModalOpen(false)}
          onLogout={onLogout}
        />
      )}

      {activeChatLead && (
        <ChatModal
          entity={activeChatLead}
          title={profile === 'corretor' ? `Chat com ${activeChatLead.nome}` : 'Imobiliária Horizonte'}
          subtitle={profile === 'corretor' ? `Telefone: ${activeChatLead.telefone}` : 'Atendimento ao Cliente'}
          currentUserRole={profile}
          onClose={() => setActiveChatLead(null)}
          onSend={(text) => sendLeadMessage(activeChatLead.id, text, profile)}
        />
      )}

      {activeDealChat && (
        <ChatModal
          entity={activeDealChat}
          title={`Negociação: ${activeDealChat.name}`}
          subtitle={`Imóvel: ${activeDealChat.property}`}
          currentUserRole={profile}
          onClose={() => setActiveDealChat(null)}
          onSend={(text) => sendDealMessage(activeDealChat.id, text, profile)}
        />
      )}
    </div>
  );
}

function UserProfileModal({ user, onClose, onLogout }) {
  const initials = getInitials(user.name);
  const isBroker = user.role === 'corretor';
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="workflow-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">MINHA CONTA</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '10px 0 18px' }}>
          <div className="avatar" style={{ width: '52px', height: '52px', fontSize: '16px' }}>{initials}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{user.name}</h2>
            <small style={{ color: '#77847d', fontSize: '12px' }}>
              {isBroker ? `Corretor · ${user.creci || 'CRECI 123456'}` : 'Cliente Morada'}
            </small>
          </div>
        </div>

        <div className="profile-details-card">
          <div>
            <span>E-mail cadastrado</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Telefone</span>
            <strong>{user.phone || '(19) 99999-9999'}</strong>
          </div>
          <div>
            <span>Perfil da conta</span>
            <strong>{isBroker ? 'Corretor de Imóveis' : 'Cliente'}</strong>
          </div>
        </div>

        <div className="workflow-actions" style={{ marginTop: '18px' }}>
          <button type="button" className="button button-light" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="button button-dark" onClick={onLogout}>
            <LogOut size={15} /> Sair da conta
          </button>
        </div>
      </section>
    </div>
  );
}

function BrokerDashboard({ userName, dashboard, leads = [], properties, loading, onSection, onOpenProperty }) {
  const [taskList, setTaskList] = useState([]);
  const [taskView, setTaskView] = useState('pending');
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState('');
  useEffect(() => setTaskList(dashboard?.tarefas || []), [dashboard?.tarefas]);
  const activeTasks = taskList.filter((task) => !task.concluida);
  const completedTasks = taskList.filter((task) => task.concluida);
  const visibleTasks = taskView === 'pending' ? activeTasks : completedTasks;
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()).toLocaleUpperCase('pt-BR');
  const firstName = (userName || 'Corretor').split(' ')[0];

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTaskList((current) => [...current, { id: Date.now(), titulo: newTask.trim(), descricao: 'Adicionada agora', concluida: false }]);
    setNewTask('');
    setAddingTask(false);
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Bom dia, {firstName} <span className="greeting-sun">✳</span></h1>
          <p className="page-subtitle">Vamos encontrar o próximo lar de alguém? Veja como está seu dia.</p>
        </div>
        <button className="button button-dark" onClick={() => onSection('Imóveis')}><House size={16} /> Ver imóveis</button>
      </section>
      <section className="metric-grid">
        <MetricCard icon={House} label="Imóveis disponíveis" value={loading ? '—' : dashboard?.imoveisDisponiveis ?? properties.length} detail={`${dashboard?.imoveisNaCarteira ?? properties.length} imóveis na carteira`} />
        <MetricCard icon={Users} label="Novos leads" value={loading ? '—' : dashboard?.novosLeads ?? leads.length} detail="Desde o início do dia" tone="mint" />
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
          {addingTask ? (
            <form className="add-task-form" onSubmit={addTask}>
              <input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Descreva a nova tarefa" aria-label="Nova tarefa" />
              <button type="submit">Salvar</button>
              <button type="button" onClick={() => { setAddingTask(false); setNewTask(''); }}>Cancelar</button>
            </form>
          ) : (
            <button className="add-task" onClick={() => setAddingTask(true)}><Plus size={16} /> Adicionar tarefa</button>
          )}
        </section>
        <aside className="right-column">
          <section className="panel lead-summary">
            <div className="panel-heading"><div><h2>Leads recentes</h2><p>Novas pessoas procurando um lar.</p></div><button className="icon-button" onClick={() => onSection('Meus contatos')}><ArrowUpRight size={17} /></button></div>
            {leads.slice(0, 2).map((lead, index) => (
              <div key={lead.id} className="lead-person">
                <div className={`avatar lead-avatar ${index ? 'lilac' : 'coral'}`}>{getInitials(lead.nome)}</div>
                <span><strong>{lead.nome}</strong><small>{lead.interesse}</small></span>
                <span className="lead-time">{lead.data}</span>
              </div>
            ))}
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

function PropertyCatalog({ profile, properties, search, type, purpose, favoriteIds, loading, onSearch, onType, onPurpose, onFavorite, onOpenProperty, onLead, onAddProperty }) {
  const client = profile === 'cliente';
  return (
    <>
      <section className={`catalog-heading ${client ? 'client-heading' : ''}`}>
        {client && <div className="catalog-welcome"><span className="eyebrow"><Sparkles size={14} /> UM LUGAR PARA CHAMAR DE SEU</span><h1>Seu próximo capítulo<br />começa em casa.</h1><p>Encontre um espaço com a sua cara, no seu tempo.</p></div>}
        {!client && <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}><div><h1>Imóveis</h1><p className="page-subtitle">Sua carteira organizada. O imóvel certo, sempre à mão.</p></div><button className="button button-dark" onClick={onAddProperty}><Plus size={17} /> Adicionar imóvel</button></div>}
        {client && <div className="client-hero-image"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" alt="Sala de estar iluminada com vista para a cidade" /></div>}
      </section>
      <div className="catalog-counts">
        <span><strong>{properties.length}</strong> {client ? 'imóveis encontrados' : 'imóveis na carteira'}</span>
        {!client && <span><strong className="green-text">{properties.filter((property) => property.status === 'DISPONIVEL').length}</strong> disponíveis</span>}
        {client && <span className="count-note">Feitos para o seu próximo começo.</span>}
      </div>
      <section className="filter-row">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={client ? 'Busque por bairro, cidade ou código' : 'Buscar por código, bairro ou endereço'} />
          <kbd>⌘ K</kbd>
        </label>
        <div className={`select-filter ${purpose ? 'filter-active' : ''}`}>
          <SlidersHorizontal size={16} />
          <select value={purpose} onChange={(event) => onPurpose(event.target.value)} aria-label="Finalidade">
            <option value="">Todas finalidades</option>
            <option value="VENDA">Venda</option>
            <option value="LOCACAO">Locação</option>
          </select>
          <ChevronDown size={14} />
        </div>
        <div className={`select-filter ${type ? 'filter-active' : ''}`}>
          <House size={16} />
          <select value={type} onChange={(event) => onType(event.target.value)} aria-label="Tipo de imóvel">
            <option value="">Todos os tipos</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
          </select>
          <ChevronDown size={14} />
        </div>
        <button
          type="button"
          className={`filter-button ${(search || type || purpose) ? 'filter-clear-ready' : ''}`}
          onClick={() => { onSearch(''); onType(''); onPurpose(''); }}
        >
          <Filter size={16} /> Limpar filtros
        </button>
      </section>
      <div className="results-line"><span>{loading ? 'Carregando imóveis...' : client ? `${properties.length} imóveis encontrados` : `Exibindo ${properties.length} imóveis da carteira`}</span>{client && <button className="sort-button"><ArrowDownUp size={14} /> Mais recentes</button>}</div>
      {loading ? <div className="loading-grid"><div /><div /><div /></div> : properties.length ? <div className="property-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} favorite={favoriteIds.includes(property.id)} onFavorite={() => onFavorite(property.id)} onOpen={() => onOpenProperty(property)} onLead={() => onLead(property)} client={client} />)}</div> : <EmptyState icon={Search} title="Nenhum imóvel encontrado" text="Tente mudar a busca ou remover alguns filtros." />}
    </>
  );
}

function PropertyCard({ property, favorite, onFavorite, onOpen, onLead, client = false }) {
  return (
    <article className="property-card">
      <button className="property-photo" onClick={onOpen} aria-label={`Ver detalhes de ${property.titulo}`}><img src={property.imagem} alt={property.titulo} loading="lazy" /><span className={`purpose-badge ${property.finalidade === 'LOCACAO' ? 'rent-badge' : ''}`}>{property.finalidade === 'LOCACAO' ? 'Locação' : 'Venda'}</span><span className={`availability ${property.status === 'DISPONIVEL' ? '' : 'reserved'}`}>{property.status === 'DISPONIVEL' ? 'Disponível' : 'Em negociação'}</span></button>
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

function LeadDialog({ property, defaultName, defaultEmail, defaultPhone, errorMessage, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="lead-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">VAMOS CONVERSAR</span><h2>Esse pode ser o seu lugar.</h2>
        <p>Deixe seus dados e a equipe Morada entra em contato com você.</p>
        {property && <div className="lead-property-preview"><img src={property.imagem} alt="" /><span><strong>{property.titulo}</strong><small>{property.codigo} · {compactCurrency(property.preco)}</small></span></div>}
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          <label>Seu nome<input name="nome" defaultValue={defaultName || ''} placeholder="Como podemos chamar você?" maxLength={100} required /></label>
          <div className="form-two">
            <label>E-mail<input name="email" type="email" defaultValue={defaultEmail || ''} placeholder="voce@email.com" maxLength={254} required /></label>
            <label>Telefone<input name="telefone" type="tel" defaultValue={defaultPhone || ''} placeholder="(19) 99999-9999" maxLength={20} required /></label>
          </div>
          <label>O que gostaria de saber?<textarea name="mensagem" placeholder="Conte um pouco sobre o que procura..." rows="3" maxLength={1000} /></label>
          {errorMessage && <p className="lead-form-error" role="alert">{errorMessage}</p>}
          <button className="button button-dark submit-button" type="submit">Solicitar contato <ArrowRight size={16} /></button>
        </form>
      </section>
    </div>
  );
}

function ClientMessagesWorkspace({ leads, onShowProperties, onOpenChat }) {
  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">SEUS CONTATOS</p><h1>Mensagens</h1><p className="page-subtitle">Acompanhe suas conversas com nossos corretores.</p></div>
        <button className="button button-dark" onClick={onShowProperties}><House size={16} /> Buscar imóveis</button>
      </section>

      <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
        {!leads.length && <EmptyState icon={MessageCircle} title="Nenhuma mensagem" text="Suas interações e mensagens com corretores aparecerão aqui." />}
        {leads.map((lead) => {
          const lastMsg = lead.chat[lead.chat.length - 1];
          const senderLabel = lastMsg?.sender === 'corretor' ? 'Corretor' : 'Você';
          return (
            <div key={lead.id} className="client-message-card" onClick={() => onOpenChat(lead)}>
              <div className="avatar lead-avatar mint" style={{ width: '42px', height: '42px', flex: 'none' }}><Building2 size={18} /></div>
              <div className="client-message-info">
                <div className="client-message-top">
                  <strong>Equipe Morada Horizonte</strong>
                  <span className="client-property-tag">{lead.interesse || 'Interesse em imóvel'}</span>
                </div>
                <p className="client-message-preview">
                  <span>{senderLabel}:</span> {lastMsg?.text || 'Sem mensagens recentes'}
                </p>
              </div>
              <button className="button button-light" style={{ height: '36px', fontSize: '11px', flex: 'none' }}><MessageCircle size={14} /> Abrir chat</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function LeadWorkspace({ dashboard, leads, onShowProperties, onAddContact, onUpdateStatus, onOpenChat }) {
  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">RELACIONAMENTO</p><h1>Meus contatos</h1><p className="page-subtitle">Cada boa conversa pode começar uma nova história.</p></div><button className="button button-dark" onClick={onAddContact}><Plus size={17} /> Adicionar contato</button></section>
      <section className="metric-grid small-metrics"><MetricCard icon={Users} label="Leads ativos" value={dashboard?.novosLeads ?? leads.length} detail="No momento" /><MetricCard icon={Clock3} label="Aguardando retorno" value="2" detail="Responda com carinho" tone="sand" /><MetricCard icon={CalendarDays} label="Visitas agendadas" value="4" detail="Nesta semana" tone="mint" /></section>
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Seus contatos</h2><p>Organize conversas e próximos passos.</p></div><button className="select-filter compact-select"><ListFilter size={15} /> Todos os contatos <ChevronDown size={14} /></button></div>
        <div className="contact-table"><div className="table-row table-head" style={{ gridTemplateColumns: '1.2fr 1.3fr 1fr 1.2fr 95px 32px' }}><span>CONTATO</span><span>INTERESSE</span><span>DATA</span><span>STATUS</span><span>CHAT</span><span /></div>
          {leads.map((lead, index) => (
            <div key={lead.id} className="table-row" style={{ gridTemplateColumns: '1.2fr 1.3fr 1fr 1.2fr 95px 32px' }}>
              <span className="table-person"><span className={`avatar lead-avatar ${['coral', 'lilac', 'mint'][index % 3]}`}>{getInitials(lead.nome)}</span><span><strong>{lead.nome}</strong><small>{lead.email}</small></span></span>
              <span>{lead.interesse}</span>
              <span>{lead.data}</span>
              <span>
                <select value={lead.status} onChange={(e) => onUpdateStatus(lead.id, e.target.value)} className="select-filter compact-select" style={{ width: '100%', height: '32px' }}>
                  <option value="Novo lead">Novo lead</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Visita agendada">Visita agendada</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </span>
              <span>
                <button className="card-contact-button" onClick={() => onOpenChat(lead)} style={{ margin: 0 }}><MessageCircle size={14} /> Chat</button>
              </span>
              <button className="icon-button"><MoreHorizontal size={18} /></button>
            </div>
          ))}
          {!leads.length && <EmptyState icon={Users} title="Ainda não há leads" text="As solicitações de contato dos clientes aparecerão aqui." />}
        </div>
      </section>
      <div className="tip-banner"><Sparkles size={20} /><span><strong>Uma boa indicação começa com escuta.</strong><small>Confira imóveis que combinam com o perfil dos seus clientes.</small></span><button className="text-button" onClick={onShowProperties}>Ver imóveis <ArrowRight size={15} /></button></div>
    </>
  );
}

function ChatModal({ entity, title, subtitle, currentUserRole, onClose, onSend }) {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entity.chat]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="workflow-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', height: '600px', display: 'flex', flexDirection: 'column' }}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">{currentUserRole === 'corretor' ? 'ATENDIMENTO AO CLIENTE' : 'ATENDIMENTO'}</span>
        <h2>{title}</h2>
        <p style={{ marginBottom: '10px' }}>{subtitle}</p>

        <div style={{ flex: 1, overflowY: 'auto', background: '#f8faf9', border: '1px solid #e2e7e2', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entity.chat.map((c, i) => {
            const isMe = (currentUserRole === 'corretor' && c.sender === 'corretor') || (currentUserRole === 'cliente' && c.sender === 'client');

            return (
              <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#286b5c' : '#fff', color: isMe ? '#fff' : '#2b3e37', padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: isMe ? 'none' : '1px solid #e2e7e2' }}>
                <small style={{ display: 'block', fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>
                  {isMe ? 'Você' : (currentUserRole === 'corretor' ? (entity.nome || entity.name) : 'Corretor')}
                </small>
                {c.text}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSend(text); setText(''); }} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="text" placeholder="Digite sua mensagem..." value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e7e2' }} autoFocus />
          <button type="submit" className="button button-dark"><Send size={16} /> Enviar</button>
        </form>
      </section>
    </div>
  );
}

function NewPropertyDialog({ errorMessage, saving, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="workflow-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        <span className="eyebrow">NOVO IMÓVEL NA CARTEIRA</span>
        <h2>Cadastrar Imóvel</h2>
        <p>Este imóvel irá direto para o catálogo geral e ficará disponível na Consultora IA.</p>
        <form className="workflow-form" onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          <label>Título do Imóvel<input name="titulo" placeholder="Ex: Apartamento Moderno no Cambuí" required maxLength={100} /></label>
          <div className="form-two">
            <label>Tipo
              <select name="tipo" defaultValue="APARTAMENTO">
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
              </select>
            </label>
            <label>Finalidade
              <select name="finalidade" defaultValue="VENDA">
                <option value="VENDA">Venda</option>
                <option value="LOCACAO">Locação</option>
              </select>
            </label>
          </div>
          <div className="form-three" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <label>Preço (R$)<input name="preco" type="number" min="1" step="0.01" placeholder="750000" required /></label>
            <label>Área (m²)<input name="area" type="number" min="1" step="0.1" placeholder="85" required /></label>
            <label>Bairro<input name="bairro" placeholder="Cambuí" required /></label>
          </div>
          <div className="form-three" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <label>Quartos<input name="quartos" type="number" min="0" placeholder="2" required /></label>
            <label>Banheiros<input name="banheiros" type="number" min="0" placeholder="2" required /></label>
            <label>Condomínio (R$)<input name="condominio" type="number" min="0" defaultValue="0" /></label>
          </div>
          <div className="form-two">
            <label>Cidade<input name="cidade" defaultValue="Campinas" required /></label>
            <label>Endereço Completo<input name="endereco" placeholder="Rua Coronel Quirino, 500" required /></label>
          </div>
          <label>URL da Imagem (Foto)<input name="imagem" placeholder="https://images.unsplash.com/..." /></label>
          <label>Descrição do Imóvel<textarea name="descricao" placeholder="Descreva os pontos fortes..." rows="2" /></label>
          {errorMessage && <p className="lead-form-error" role="alert">{errorMessage}</p>}
          <div className="workflow-actions">
            <button className="button button-light" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Cadastrando...' : 'Cadastrar Imóvel'} <ArrowRight size={16} /></button>
          </div>
        </form>
      </section>
    </div>
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

function DealWorkspace({ properties, deals, activeDealCount, onCreateDeal, onUpdateStage, onOpenChat }) {
  const [addingDeal, setAddingDeal] = useState(false);
  const [dealError, setDealError] = useState('');

  function addDeal(formData) {
    const property = properties.find((item) => item.id === Number(formData.get('imovelId')));
    const name = formData.get('cliente').trim();
    const stage = formData.get('etapa');
    const progressByStage = { 'Primeiro contato': 1, 'Visita agendada': 2, 'Proposta enviada': 3, Documentação: 4 };

    if (!property) { setDealError('Selecione um imóvel válido para a negociação.'); return; }

    onCreateDeal({
      id: Date.now(),
      initials: getInitials(name),
      name,
      property: `${property.titulo} · ${property.codigo}`,
      amount: compactCurrency(Number(formData.get('valor'))),
      stage,
      progress: progressByStage[stage],
      tone: 'mint',
      chat: [{ sender: 'client', text: 'Estou no aguardo dos próximos passos.' }],
    });
    setDealError('');
    setAddingDeal(false);
  }

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">DO PRIMEIRO OI À CHAVE</p><h1>Negociações</h1><p className="page-subtitle">Acompanhe cada etapa até o novo começo.</p></div><button className="button button-dark" onClick={() => { setDealError(''); setAddingDeal(true); }}><Plus size={17} /> Nova negociação</button></section>
      <section className="metric-grid small-metrics"><MetricCard icon={ClipboardList} label="Em andamento" value={activeDealCount} detail="Inclui negócios criados nesta sessão" /><MetricCard icon={CheckCheck} label="Concluídas no mês" value="8" detail="Um ótimo resultado" tone="mint" /><MetricCard icon={Clock3} label="Aguardando proposta" value="3" detail="Próxima ação necessária" tone="sand" /></section>
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Suas negociações</h2><p>Uma visão clara do que vem pela frente.</p></div></div>
        <div className="deal-list">
          {deals.map((deal) => (
            <div key={deal.id} className="deal-row" style={{ gridTemplateColumns: '34px minmax(130px, 1.2fr) 90px minmax(140px, 1.2fr) 95px 70px 30px' }}>
              <span className={`avatar lead-avatar ${deal.tone || 'mint'}`}>{deal.initials}</span>
              <span className="deal-person"><strong>{deal.name}</strong><small>{deal.property}</small></span>
              <strong className="deal-amount">{deal.amount}</strong>
              <span className="deal-stage">
                <select value={deal.stage} onChange={(e) => onUpdateStage(deal.id, e.target.value)} className="select-filter compact-select" style={{ width: '100%', height: '32px' }}>
                  <option value="Primeiro contato">Primeiro contato</option>
                  <option value="Visita agendada">Visita agendada</option>
                  <option value="Proposta enviada">Proposta enviada</option>
                  <option value="Documentação">Documentação</option>
                </select>
              </span>
              <span>
                <button className="card-contact-button" onClick={() => onOpenChat(deal)} style={{ margin: 0 }}><MessageCircle size={14} /> Chat</button>
              </span>
              <div className="progress-dots">{[1, 2, 3, 4].map((step) => <i key={step} className={step <= deal.progress ? 'step-done' : ''} />)}</div>
              <button className="icon-button"><MoreHorizontal size={18} /></button>
            </div>
          ))}
        </div>
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
                    <option value="Primeiro contato">Primeiro contato</option>
                    <option value="Visita agendada">Visita agendada</option>
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Documentação">Documentação</option>
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

function EmptyState({ icon: Icon, title, text }) {
  return <div className="empty-state"><Icon size={27} /><strong>{title}</strong><span>{text}</span></div>;
}